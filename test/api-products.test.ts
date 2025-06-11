import { strict as assert } from 'assert'
import { newDb } from 'pg-mem'
import pkg from 'pg'

const db = newDb()
const { Pool } = db.adapters.createPg()
// patch pg Pool
pkg.Pool = Pool

process.env.DB_USER='user'
process.env.DB_HOST='localhost'
process.env.DB_NAME='test'
process.env.DB_PASSWORD='pass'
process.env.DB_PORT='5432'
process.env.ADMIN_USER='admin'
process.env.ADMIN_PASS='adminpass'

import { initializeDatabase, seedDatabase } from '../lib/db'
import { GET } from '../app/api/products/route'

await initializeDatabase()
await seedDatabase()

const res = await GET()
const products = await res.json()
assert.ok(Array.isArray(products))
assert.ok(products.length > 0)
