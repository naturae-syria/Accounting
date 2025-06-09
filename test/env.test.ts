import { strict as assert } from 'assert'
import { env } from '../lib/env'

test('environment variables are loaded', () => {
  assert.ok(env.DB_USER)
  assert.ok(env.DB_HOST)
  assert.ok(env.DB_NAME)
  assert.ok(env.DB_PASSWORD)
  assert.ok(typeof env.DB_PORT === 'number')
})
