import { strict as assert } from 'assert'
import { GET } from '../app/api/auth/check/route'

async function run() {
  const reqNoCookie = new Request('http://localhost')
  const resNoCookie = await GET(reqNoCookie)
  const dataNoCookie = await resNoCookie.json()
  assert.equal(dataNoCookie.valid, false)

  const reqCookie = new Request('http://localhost', { headers: { cookie: 'session=auth' } })
  const resCookie = await GET(reqCookie)
  const dataCookie = await resCookie.json()
  assert.equal(dataCookie.valid, true)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
