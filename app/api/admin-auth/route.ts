import { NextRequest, NextResponse } from 'next/server'

const ADMIN_EMAIL    = process.env.DEV_ADMIN_EMAIL    ?? ''
const ADMIN_PASSWORD = process.env.DEV_ADMIN_PASSWORD ?? ''
const ADMIN_SECRET   = process.env.DEV_ADMIN_SECRET   ?? 'rentit_admin_local_secret_2026'

// Simple in-memory rate limiter (resets on server restart / per serverless instance)
const attempts = new Map<string, { count: number; firstAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function getIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry) return false
  if (now - entry.firstAt > WINDOW_MS) {
    attempts.delete(ip)
    return false
  }
  return entry.count >= MAX_ATTEMPTS
}

function recordAttempt(ip: string) {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAt: now })
  } else {
    entry.count++
  }
}

function clearAttempts(ip: string) {
  attempts.delete(ip)
}

export async function POST(req: NextRequest) {
  const ip = getIP(req)

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in 15 minutes.' },
      { status: 429 }
    )
  }

  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    recordAttempt(ip)
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  clearAttempts(ip)

  const res = NextResponse.json({ ok: true })
  res.cookies.set('dev_admin_session', ADMIN_SECRET, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('dev_admin_session')
  return res
}
