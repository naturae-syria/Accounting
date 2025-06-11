import { newDb } from 'pg-mem'
import fs from 'fs'
import path from 'path'
import { strict as assert } from 'assert'

export async function runDbUpdate() {
  const db = newDb()

  db.public.none(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)

  const dir = path.join(__dirname, '../../migrations')
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort()
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8')
    db.public.none(sql)
    db.public.none(`INSERT INTO schema_migrations (filename) VALUES ('${file}')`)
  }

  const rows = db.public.many('SELECT name FROM dummy_table')
  assert.equal(rows.length, 1)
  assert.equal(rows[0].name, 'example')

  const applied = db.public.many('SELECT filename FROM schema_migrations ORDER BY filename')
  assert.deepEqual(applied.map(r => r.filename), [
    '001_create_dummy_table.sql',
    '002_add_dummy_data.sql'
  ])
}

if (require.main === module) {
  runDbUpdate().catch(err => {
    console.error(err)
    process.exit(1)
  })
}
