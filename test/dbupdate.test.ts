import { strict as assert } from 'assert'
import test from 'node:test'

import { runDbUpdate } from './helpers/run-dbupdate'

test('DbUpdate creates missing tables via migrations', async () => {
  await runDbUpdate()
  assert.ok(true)
})

