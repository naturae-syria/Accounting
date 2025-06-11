import { strict as assert } from 'assert'
import { newDb } from 'pg-mem'
import pkg from 'pg'

const db = newDb()
const { Pool } = db.adapters.createPg()
pkg.Pool = Pool

process.env.DB_USER='user'
process.env.DB_HOST='localhost'
process.env.DB_NAME='test'
process.env.DB_PASSWORD='pass'
process.env.DB_PORT='5432'
process.env.ADMIN_USER='admin'
process.env.ADMIN_PASS='adminpass'
process.env.REDIS_URL='redis://127.0.0.1:6379'

import { initializeDatabase, seedDatabase, pool } from '../lib/db'
import { connectRedis } from '../lib/redis'
import { GET } from '../app/api/products/route'

test('cache returns data on repeated requests', async () => {
  const redis = await connectRedis()
  await redis.flushDb()

  await initializeDatabase()
  await seedDatabase()

  const res1 = await GET()
  const products1 = await res1.json()
  assert.ok(Array.isArray(products1))

  const cached = await redis.get('products')
  assert.ok(cached)

  await pool.query("INSERT INTO products (name, description, price, cost, stock) VALUES ('New', '', 1, 1, 1)")

  const res2 = await GET()
  const products2 = await res2.json()
  assert.equal(products2.length, products1.length)
})

