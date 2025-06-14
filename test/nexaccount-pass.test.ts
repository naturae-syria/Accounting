import { strict as assert } from 'assert'
import fs from 'fs'
import { execFileSync } from 'child_process'

const appDir = '/var/www/accounting-system'
fs.mkdirSync(appDir, { recursive: true })
const envPath = `${appDir}/.env.new`
try {
  execFileSync('bash', ['NexAccount', 'Pass'], { cwd: process.cwd() })
  assert.ok(fs.existsSync(envPath))
  const content = fs.readFileSync(envPath, 'utf8')
  assert.ok(content.includes('root'))
} finally {
  fs.rmSync(envPath, { force: true })
}

