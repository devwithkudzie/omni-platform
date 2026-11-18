// Deploys a staged public_html (from build-cpanel-public-html.mjs with
// DEPLOY_STAGE_DIR set) to cPanel through the cPanel API on port 2083, for hosts
// where SSH and FTP are blocked. Used by .github/workflows/deploy.yml.
//
// Only files that changed since the last deploy are sent: the previous deploy's
// file hashes are read back from config/.deploy-manifest.json on the server.
// Files are zipped in batches, uploaded, extracted over the target folder and
// the zip is deleted. Nothing on the server is ever deleted, so folders that
// live inside the target (staging.omnicontact.biz, omnitalent, cms/, uploads)
// are never touched.
//
// Env:
//   CPANEL_HOST    cPanel server hostname (e.g. web02.cp.c2.africa)
//   CPANEL_USER    cPanel username
//   CPANEL_TOKEN   cPanel API token
//   CPANEL_HOME    the account's home folder (e.g. /datadrive/omnicontact)
//   DEPLOY_PATH    target folder relative to home (e.g. public_html/staging.omnicontact.biz)
//   DEPLOY_SOURCE  local folder to deploy (the staged public_html)
//   DEPLOY_FULL    "true" to send every file, ignoring the manifest
//   DEPLOY_LABEL   label stored in the manifest (e.g. the commit SHA)
//   HEALTH_URL     optional URL that must answer 200 after the deploy
//   CPANEL_BASE_URL  testing only: use a local mock instead of https://CPANEL_HOST:2083

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createReadStream, openAsBlob } from 'node:fs'
import { mkdtemp, readdir, rm, stat, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

const MANIFEST_PATH = 'config/.deploy-manifest.json'
// cPanel uploads go through its web server; keep each batch comfortably small.
const BATCH_BYTES = 40 * 1024 * 1024

function env(name, fallback) {
  const value = (process.env[name] ?? fallback ?? '').trim()
  if (value === '') throw new Error(`${name} is not set.`)
  return value
}

const host = env('CPANEL_HOST')
const user = env('CPANEL_USER')
const token = env('CPANEL_TOKEN')
const home = env('CPANEL_HOME').replace(/\/+$/, '')
const deployPath = env('DEPLOY_PATH').replace(/^\/+|\/+$/g, '')
const source = path.resolve(env('DEPLOY_SOURCE'))
const full = (process.env.DEPLOY_FULL || '').toLowerCase() === 'true'
const label = process.env.DEPLOY_LABEL || new Date().toISOString()
const healthUrl = (process.env.HEALTH_URL || '').trim()

// CPANEL_BASE_URL is only for testing against a local mock of the cPanel API.
const baseUrl = (process.env.CPANEL_BASE_URL || `https://${host}:2083`).replace(/\/+$/, '')
const auth = { Authorization: `cpanel ${user}:${token}` }
const targetAbs = `${home}/${deployPath}`

async function uapi(module, func, { query = {}, body } = {}) {
  const url = new URL(`${baseUrl}/execute/${module}/${func}`)
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value)
  const response = await fetch(url, { method: body ? 'POST' : 'GET', headers: auth, body })
  const text = await response.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`${module}::${func} returned HTTP ${response.status}: ${text.slice(0, 300)}`)
  }
  return json
}

// cPanel API 2 is still the only API with an "extract archive" call.
async function api2(module, func, params) {
  const url = new URL(`${baseUrl}/json-api/cpanel`)
  url.searchParams.set('cpanel_jsonapi_user', user)
  url.searchParams.set('cpanel_jsonapi_apiversion', '2')
  url.searchParams.set('cpanel_jsonapi_module', module)
  url.searchParams.set('cpanel_jsonapi_func', func)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  const response = await fetch(url, { headers: auth })
  const text = await response.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`${module}::${func} returned HTTP ${response.status}: ${text.slice(0, 300)}`)
  }
  const result = json?.cpanelresult
  if (!result || result.error || result.event?.result === 0 || result.data?.[0]?.result === 0) {
    throw new Error(`${module}::${func} failed: ${JSON.stringify(result?.error || result?.data || json).slice(0, 400)}`)
  }
  return result
}

async function listFiles(dir, prefix = '') {
  const files = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await listFiles(abs, rel)))
    else if (entry.isFile()) files.push(rel)
  }
  return files
}

function sha256(file) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    createReadStream(file).on('data', (chunk) => hash.update(chunk)).on('end', () => resolve(hash.digest('hex'))).on('error', reject)
  })
}

async function readRemoteManifest() {
  const dir = path.posix.join(deployPath, path.posix.dirname(MANIFEST_PATH))
  const file = path.posix.basename(MANIFEST_PATH)
  // Connection or login errors throw; only a missing or unreadable manifest
  // means "first deploy".
  const result = await uapi('Fileman', 'get_file_content', { query: { dir, file } })
  if (!result.status) return null
  try {
    return JSON.parse(result.data?.content || '')
  } catch {
    return null
  }
}

// Upload order: assets first and HTML/PHP last, so a page is never live before
// the scripts and images it points to.
function rank(file) {
  if (file === MANIFEST_PATH) return 5
  if (/\.(php)$/.test(file) || file.endsWith('.htaccess')) return 4
  if (/\.(html|txt)$/.test(file)) return 3
  if (file.startsWith('_next/')) return 2
  return 1
}

function batches(files, sizes) {
  const groups = []
  let current = []
  let bytes = 0
  for (const file of files) {
    if (current.length && bytes + sizes[file] > BATCH_BYTES) {
      groups.push(current)
      current = []
      bytes = 0
    }
    current.push(file)
    bytes += sizes[file]
  }
  if (current.length) groups.push(current)
  return groups
}

async function sendBatch(files, index, total, workDir) {
  const name = `.deploy-${Date.now()}-${index + 1}.zip`
  const zipFile = path.join(workDir, name)
  const zip = spawnSync('zip', ['-q', '-X', zipFile, '-@'], { cwd: source, input: files.join('\n') })
  if (zip.status !== 0) throw new Error(`zip failed: ${zip.stderr}`)

  const form = new FormData()
  form.set('dir', deployPath)
  form.set('overwrite', '1')
  form.set('file-1', await openAsBlob(zipFile), name)
  const upload = await uapi('Fileman', 'upload_files', { body: form })
  if (!upload.status || upload.data?.failed) {
    throw new Error(`Upload of batch ${index + 1} failed: ${JSON.stringify(upload.errors || upload.data).slice(0, 400)}`)
  }

  const remoteZip = `${targetAbs}/${name}`
  try {
    await api2('Fileman', 'fileop', { op: 'extract', sourcefiles: remoteZip, destfiles: targetAbs, doubledecode: '0' })
  } finally {
    await api2('Fileman', 'fileop', { op: 'unlink', sourcefiles: remoteZip, doubledecode: '0' }).catch((error) =>
      console.warn(`Could not delete ${remoteZip}: ${error.message}`),
    )
  }
  const size = (await stat(zipFile)).size
  console.log(`Batch ${index + 1}/${total}: ${files.length} files, ${(size / 1e6).toFixed(1)} MB uploaded and extracted.`)
}

const files = (await listFiles(source)).filter((file) => file !== MANIFEST_PATH)
const hashes = {}
const sizes = {}
for (const file of files) {
  hashes[file] = await sha256(path.join(source, file))
  sizes[file] = (await stat(path.join(source, file))).size
}

const previous = full ? null : await readRemoteManifest()
const changed = files.filter((file) => previous?.files?.[file] !== hashes[file])
console.log(
  previous
    ? `Last deploy: ${previous.label}. ${changed.length} of ${files.length} files changed.`
    : `${full ? 'Full deploy requested' : 'No previous deploy found'}: sending all ${files.length} files.`,
)

const manifest = { label, deployedAt: new Date().toISOString(), files: hashes }
await writeFile(path.join(source, MANIFEST_PATH), JSON.stringify(manifest))
sizes[MANIFEST_PATH] = (await stat(path.join(source, MANIFEST_PATH))).size

const toSend = [...changed, MANIFEST_PATH].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
const groups = batches(toSend, sizes)
const workDir = await mkdtemp(path.join(os.tmpdir(), 'cpanel-deploy-'))
try {
  for (const [index, group] of groups.entries()) await sendBatch(group, index, groups.length, workDir)
} finally {
  await rm(workDir, { recursive: true, force: true })
}

// The manifest goes up last: reading it back proves the extract overwrote files.
const check = await readRemoteManifest()
if (check?.label !== label) {
  throw new Error('Deploy finished but the server still has the old manifest; extraction may not be overwriting files.')
}
console.log(`Deployed ${label} to ${deployPath}.`)

if (healthUrl) {
  const response = await fetch(healthUrl)
  if (response.headers.get('cf-mitigated')) {
    console.warn(`Health check skipped: Cloudflare showed its bot check to ${healthUrl}.`)
  } else if (response.status !== 200) {
    throw new Error(`Health check ${healthUrl} answered HTTP ${response.status}.`)
  } else {
    console.log(`Health check OK: ${healthUrl}`)
  }
}
