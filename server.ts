import express from 'express'
import next from 'next'
import cookieParser from 'cookie-parser'
import { env } from './lib/env'
import { getUserByUsername } from './lib/db'
import { verifyPassword } from './lib/auth'

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()

interface Attempt {
  count: number
  last: number
}
const attempts = new Map<string, Attempt>()

function recordAttempt(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip) || { count: 0, last: now }
  if (now - entry.last > 5 * 60 * 1000) {
    entry.count = 0
    entry.last = now
  }
  entry.count += 1
  attempts.set(ip, entry)
  return entry.count <= 5
}

nextApp.prepare().then(() => {
  const app = express()
  app.use(express.json())
  app.use(cookieParser())

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body || {}
    if (!recordAttempt(req.ip)) {
      return res.status(429).json({ success: false })
    }
    try {
      const user = await getUserByUsername(username)
      if (user && (await verifyPassword(password, user.passwordHash))) {
        res.cookie('session', 'auth', {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
        })
        return res.json({ success: true })
      }
      return res.status(401).json({ success: false })
    } catch (err) {
      console.error('Login error:', err)
      return res.status(500).json({ success: false })
    }
  })

  app.post('/api/auth/logout', (_req, res) => {
    res.cookie('session', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0,
    })
    res.end()
  })

  app.get('/api/auth/check', (req, res) => {
    const valid = req.cookies.session === 'auth'
    res.json({ valid })
  })

  app.all('*', (req, res) => handle(req, res))

  const port = Number(process.env.PORT || 3000)
  const host = process.env.HOSTNAME || '0.0.0.0'
  app.listen(port, host, () => {
    console.log(`> Ready on http://${host}:${port}`)
  })
})
