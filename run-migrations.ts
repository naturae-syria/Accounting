import fs from 'fs'
import path from 'path'
import { pool } from './lib/db'

const migrationsDir = path.join(__dirname, 'migrations')

async function run() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    const res = await client.query('SELECT filename FROM schema_migrations')
    const applied = new Set(res.rows.map((r: any) => r.filename))

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort()

    for (const file of files) {
      if (!applied.has(file)) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
        await client.query(sql)
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file]
        )
        console.log(`Applied migration ${file}`)
      }
    }

    await client.query('COMMIT')
    console.log('Migrations complete')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Migration failed:', err)
    throw err
  } finally {
    client.release()
  }
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
