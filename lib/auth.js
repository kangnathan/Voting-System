import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const COOKIE = 'voting_session'
const EXPIRY = '8h'

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET)
}

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret())
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, getSecret())
  return payload
}

export async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE)?.value
  if (!token) return null
  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}

export async function requireRole(minRole = 'admin') {
  const user = await getAuthUser()
  if (!user) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 })
  }
  if (minRole === 'super_admin' && user.role !== 'super_admin') {
    throw Object.assign(new Error('Forbidden'), { status: 403 })
  }
  return user
}

export function setAuthCookie(response, token) {
  response.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
  return response
}

export function clearAuthCookie(response) {
  response.cookies.set(COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}
