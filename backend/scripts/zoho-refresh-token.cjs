#!/usr/bin/env node
// One-time helper: swaps a Zoho Self Client "Generate Code" grant for a
// refresh token and writes it into backend/cms/config.local.php.
// The Client ID/Secret are read from that file; nothing is printed in full.
//
// Usage:  node backend/scripts/zoho-refresh-token.cjs
//         (then paste the code from api-console.zoho.com when asked)

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const configPath = path.join(__dirname, '..', 'cms', 'config.local.php')
let config = fs.readFileSync(configPath, 'utf8')

const read = (key) => {
  const match = config.match(new RegExp(`define\\('${key}',\\s*'([^']*)'\\)`))
  return match ? match[1].trim() : ''
}

const clientId = read('ZOHO_CLIENT_ID')
const clientSecret = read('ZOHO_CLIENT_SECRET')
const accountsUrl = read('ZOHO_ACCOUNTS_URL') || 'https://accounts.zoho.com'

if (!clientId || !clientSecret) {
  console.error('ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET must be set in', configPath)
  process.exit(1)
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
rl.question('Paste the code from Zoho API Console > Self Client > Generate Code: ', async (answer) => {
  rl.close()
  const code = answer.trim()
  if (!code) {
    console.error('No code entered.')
    process.exit(1)
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code,
  })

  let data
  try {
    const res = await fetch(`${accountsUrl}/oauth/v2/token`, { method: 'POST', body })
    data = await res.json()
  } catch (error) {
    console.error('Could not reach Zoho:', error.message)
    process.exit(1)
  }

  if (!data.refresh_token) {
    console.error('Zoho did not return a refresh token. Response:', data.error || data)
    if (data.error === 'invalid_code') {
      console.error('The code expired or was already used. Generate a new one and run this again straight away.')
    }
    process.exit(1)
  }

  config = config.replace(
    /define\('ZOHO_REFRESH_TOKEN',\s*'[^']*'\)/,
    `define('ZOHO_REFRESH_TOKEN', '${data.refresh_token}')`
  )
  if (data.api_domain) {
    config = config.replace(
      /define\('ZOHO_API_DOMAIN',\s*'[^']*'\)/,
      `define('ZOHO_API_DOMAIN', '${data.api_domain}')`
    )
  }
  fs.writeFileSync(configPath, config)

  console.log('Done. Refresh token saved to cms/config.local.php')
  console.log('Token starts with:', data.refresh_token.slice(0, 9) + '…')
  console.log('API domain:', data.api_domain || '(unchanged)')
  console.log('Granted scope:', data.scope || '(not reported)')
})
