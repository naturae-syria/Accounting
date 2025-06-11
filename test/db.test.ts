import { strict as assert } from 'assert'
import { newDb } from 'pg-mem'
import pkg from 'pg'

const mem = newDb()
const { Pool } = mem.adapters.createPg()
pkg.Pool = Pool

process.env.DB_USER='user'
process.env.DB_HOST='localhost'
process.env.DB_NAME='test'
process.env.DB_PASSWORD='pass'
process.env.DB_PORT='5432'
process.env.ADMIN_USER='admin'
process.env.ADMIN_PASS='adminpass'

import { initializeDatabase, seedDatabase, getProducts } from '../lib/db'

await initializeDatabase()
await seedDatabase()

const products = await getProducts()
assert.ok(Array.isArray(products))
assert.ok(products.length > 0)
