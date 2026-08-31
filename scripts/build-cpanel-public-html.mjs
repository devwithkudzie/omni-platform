import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, mkdir, rm, writeFile, rename } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import os from 'node:os'

const root = process.cwd()
const frontendOut = path.join(root, 'frontend', 'out')
const tempRoot = path.join(os.tmpdir(), `omnicontact-cpanel-${Date.now()}`)
const excludeRoot = path.join(tempRoot, 'excluded-routes')
const stageRoot = path.join(tempRoot, 'stage')
const publicHtml = path.join(stageRoot, 'public_html')
const dateStamp = new Date().toISOString().slice(0, 10)
const zipName = process.env.DEPLOY_ZIP || `omnicontact-public_html-cpanel-${dateStamp}.zip`
const zipPath = path.resolve(root, zipName)

const excludedRoutes = [
  {
    from: path.join(root, 'frontend', 'src', 'app', '(admin)', 'admin', 'blogs', '[id]'),
    to: path.join(excludeRoot, 'admin-blog-id'),
  },
  {
    from: path.join(root, 'frontend', 'src', 'app', '(site)', 'insights', '[slug]'),
    to: path.join(excludeRoot, 'insights-slug'),
  },
]

const htaccess = `Options -MultiViews
RewriteEngine On

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

async function packageExport() {
  await writeFile(path.join(frontendOut, '.htaccess'), htaccess)
  await rm(stageRoot, { recursive: true, force: true })
  await mkdir(stageRoot, { recursive: true })
  await cp(frontendOut, publicHtml, { recursive: true })
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

console.log(`Created ${path.relative(root, zipPath)}`)
