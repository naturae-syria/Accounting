import { strict as assert } from 'assert'
import { hashPassword, verifyPassword } from '../lib/auth'

test('password hashing and verification', async () => {
  const password = 'secret'
  const hash = await hashPassword(password)
  assert.notEqual(hash, password)
  assert.ok(await verifyPassword(password, hash))
  assert.ok(!(await verifyPassword('wrong', hash)))
})
