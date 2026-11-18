import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, mkdir, readFile, rm, writeFile, rename } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import os from 'node:os'

const root = process.cwd()
const frontendOut = path.join(root, 'frontend', 'out')
const backendRoot = path.join(root, 'backend')
// Only the modern router's own folders — never 'cms', which already lives on the
// server with production secrets and legacy admin code this repo's copy lacks.
const backendIncludeFolders = ['public', 'routes', 'src', 'config', 'api']
const jwtSecret = process.env.JWT_SECRET || ''
const tempRoot = path.join(os.tmpdir(), `omnicontact-cpanel-${Date.now()}`)
const excludeRoot = path.join(tempRoot, 'excluded-routes')
// DEPLOY_STAGE_DIR (used by GitHub Actions) leaves the built public_html in that
// folder for scripts/deploy-cpanel.mjs instead of zipping it.
const stageDir = process.env.DEPLOY_STAGE_DIR ? path.resolve(process.env.DEPLOY_STAGE_DIR) : ''
const stageRoot = stageDir || path.join(tempRoot, 'stage')
const publicHtml = path.join(stageRoot, 'public_html')
const dateStamp = new Date().toISOString().slice(0, 10)
const zipName = process.env.DEPLOY_ZIP || `omnicontact-public_html-cpanel-${dateStamp}.zip`
const zipPath = path.resolve(root, zipName)

const excludedRoutes = [
  {
    from: path.join(root, 'frontend', 'src', 'app', '(admin)', 'admin', 'blogs', '[id]'),
    to: path.join(excludeRoot, 'admin-blog-id'),
  },
]

const htaccess = `Options -MultiViews
RewriteEngine On

# Route API requests to the PHP backend router (backend/public/index.php,
# merged into this same public_html — see docs/env.md).
RewriteRule ^api/v1(?:/.*)?$ public/index.php [L,QSA]

# Individual insight articles are created after the build (via the CMS), so
# there's no pre-built file per slug. Every real /insights/<slug> URL serves
# the one pre-built shell page instead (URL bar stays correct) — the shell
# resolves the real slug and fetches that post client-side.
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^insights/[^/]+/?$ insights/_shell/index.html [L]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.+)$ $1.html [L]

ErrorDocument 404 /404.html
`

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
    ...options,
    env: {
      ...process.env,
      ...(options.env || {}),
    },
  })

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with status ${result.status}`)
  }
}

async function moveExcludedRoutesOut() {
  await mkdir(excludeRoot, { recursive: true })

  for (const route of excludedRoutes) {
    if (!existsSync(route.from)) {
      console.warn(`Skipping missing dynamic route: ${path.relative(root, route.from)}`)
      continue
    }

    await rename(route.from, route.to)
  }
}

async function restoreExcludedRoutes() {
  for (const route of excludedRoutes) {
    if (!existsSync(route.to)) {
      continue
    }

    await mkdir(path.dirname(route.from), { recursive: true })
    await rename(route.to, route.from)
  }
}

async function copyBackend() {
  for (const folder of backendIncludeFolders) {
    const from = path.join(backendRoot, folder)
    if (!existsSync(from)) {
      console.warn(`Skipping missing backend folder: ${folder}`)
      continue
    }

    await cp(from, path.join(publicHtml, folder), { recursive: true })
  }

  // Empty in the repo (gitignored contents), but the app expects it to exist.
  await mkdir(path.join(publicHtml, 'storage', 'logs'), { recursive: true })

  await writeServerConfig()

  if (jwtSecret) {
    // Adds only this one file into the server's existing cms/ folder — never
    // touches anything else there, since cms/ itself is excluded above.
    await mkdir(path.join(publicHtml, 'cms'), { recursive: true })
    await writeFile(
      path.join(publicHtml, 'cms', 'config.local.php'),
      `<?php\n// cms/config.local.php\n// Server-only overrides. Never commit this file.\n\ndefine('JWT_SECRET', '${jwtSecret.replace(/'/g, "\\'")}');\n`,
    )
    console.log('Included cms/config.local.php (JWT_SECRET only — no other cms/ files touched).')
  } else {
    console.warn('JWT_SECRET env var not set — skipping cms/config.local.php. Create it manually on the server, or rerun with JWT_SECRET=... set.')
  }
}

// The server's cms/ folder can't be edited, so the Zoho CRM and Microsoft 365 mail
// keys ship as their own file in config/ (loaded by public/index.php). Only the
// keys listed here are copied from the local, git-ignored cms/config.local.php.
// They're set with putenv(): config/app.php reads env values before constants, so
// these win over anything in the server's cms config without redefining constants.
const serverKeys = [
  'ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN', 'ZOHO_ACCOUNTS_URL', 'ZOHO_API_DOMAIN',
  'TENANT_ID', 'CLIENT_ID', 'CLIENT_SECRET', 'SERVICE_ACCOUNT',
]
const requiredServerKeys = ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN', 'TENANT_ID', 'CLIENT_ID', 'CLIENT_SECRET', 'SERVICE_ACCOUNT']

// Values are PHP single-quoted literal contents (as written in config.local.php).
async function readServerKeys() {
  const source = path.join(backendRoot, 'cms', 'config.local.php')
  const values = new Map()

  if (existsSync(source)) {
    const text = await readFile(source, 'utf8')
    // Matches define('KEY', 'value') and define('KEY', getenv('KEY') ?: 'value');
    // the value is the last single-quoted literal on the line.
    for (const line of text.split('\n')) {
      const match = line.match(/^\s*define\(\s*'([A-Z0-9_]+)'.*'((?:[^'\\]|\\.)*)'\s*\)\s*;/)
      if (match && serverKeys.includes(match[1]) && match[2] !== '') {
        values.set(match[1], match[2])
      }
    }
    return { values, from: 'backend/cms/config.local.php' }
  }

  // No local config (e.g. GitHub Actions): read the keys from environment variables.
  for (const name of serverKeys) {
    const value = (process.env[name] || '').trim()
    if (value !== '') values.set(name, value.replace(/\\/g, '\\\\').replace(/'/g, "\\'"))
  }
  return { values, from: 'environment variables' }
}

async function writeServerConfig() {
  const { values, from } = await readServerKeys()
  const missing = requiredServerKeys.filter((name) => !values.has(name))
  if (missing.length) {
    throw new Error(`Missing ${missing.join(', ')} in ${from}; refusing to build without Zoho and mail keys.`)
  }

  // Some cPanel hosts disable putenv(); fall back to guarded constants there.
  const entries = [...values].map(([name, value]) => `    '${name}' => '${value}',`)
  const lines = [
    '$omniServerKeys = [',
    ...entries,
    '];',
    'foreach ($omniServerKeys as $omniKey => $omniValue) {',
    "    if (function_exists('putenv')) {",
    "        putenv($omniKey . '=' . $omniValue);",
    '    } elseif (!defined($omniKey)) {',
    '        define($omniKey, $omniValue);',
    '    }',
    '}',
    'unset($omniServerKeys, $omniKey, $omniValue);',
  ]
  const configDir = path.join(publicHtml, 'config')
  await writeFile(
    path.join(configDir, 'server.local.php'),
    `<?php\n// config/server.local.php: Zoho CRM and Microsoft 365 mail keys for the API.\n// Generated by scripts/build-cpanel-public-html.mjs. Never commit this file.\n\n${lines.join('\n')}\n`,
  )
  // config/ sits inside public_html; keep it unreachable from the browser.
  await writeFile(path.join(configDir, '.htaccess'), 'Require all denied\n')
  console.log(`Included config/server.local.php (${[...values.keys()].join(', ')}).`)
}

async function packageExport() {
  await writeFile(path.join(frontendOut, '.htaccess'), htaccess)
  await rm(stageRoot, { recursive: true, force: true })
  await mkdir(stageRoot, { recursive: true })
  await cp(frontendOut, publicHtml, { recursive: true })
  await copyBackend()
  run('find', [publicHtml, '-name', '.DS_Store', '-delete'])
  if (stageDir) return
  await rm(zipPath, { force: true })
  run('zip', ['-qr', zipPath, 'public_html'], { cwd: stageRoot })
}

try {
  console.log('Preparing cPanel static export...')
  await moveExcludedRoutesOut()
  run('npm', ['run', 'build', '--workspace', 'frontend'], {
    env: { CPANEL_STATIC_EXPORT: '1' },
  })
} finally {
  await restoreExcludedRoutes()
}

await packageExport()
await rm(tempRoot, { recursive: true, force: true })

console.log(stageDir ? `Staged ${path.relative(root, publicHtml) || publicHtml}` : `Created ${path.relative(root, zipPath)}`)
