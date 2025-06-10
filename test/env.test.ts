import test from 'node:test'
import { strict as assert } from 'assert'

// Provide sane defaults to avoid connecting as the root user
process.env.DB_USER ||= 'postgres'
process.env.DB_HOST ||= 'localhost'
process.env.DB_NAME ||= 'accounting_system'
process.env.DB_PASSWORD ||= 'postgres'
process.env.DB_PORT ||= '5432'

import { env } from '../lib/env'

test('environment variables are loaded', () => {
  if (env.DATABASE_URL) {
    assert.ok(env.DATABASE_URL)
  } else {
    assert.ok(env.DB_USER)
    assert.ok(env.DB_HOST)
    assert.ok(env.DB_NAME)
    assert.ok(env.DB_PASSWORD)
    assert.ok(typeof env.DB_PORT === 'number')
  }
})
