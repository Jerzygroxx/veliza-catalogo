import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { clientKey, createRateLimiter, parseTrustedProxy } from './lib/rate-limit'

const loginLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 })
const apiLimiter = createRateLimiter({ limit: 120, windowMs: 60_000 })

export const config = { matcher: '/api/:path*' }

export function proxy(request: NextRequest) {
  const trusted = parseTrustedProxy(process.env.TRUSTED_PROXY)
  const isLogin = request.method === 'POST' && request.nextUrl.pathname === '/api/users/login'

  // Sin proxy de confianza no hay forma fiable de distinguir clientes: solo se limita el login
  // (con un cubo compartido). El límite general de /api necesita IPs fiables para no frenar al panel.
  if (!isLogin && trusted === 'none') return NextResponse.next()

  const result = (isLogin ? loginLimiter : apiLimiter).check(clientKey(request.headers, trusted))
  if (!result.allowed) {
    return NextResponse.json(
      { errors: [{ message: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.' }] },
      { status: 429, headers: { 'Retry-After': String(result.retryAfterSec) } },
    )
  }
  return NextResponse.next()
}
