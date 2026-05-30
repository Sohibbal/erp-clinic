import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { UserRole } from '@/generated/prisma/client'

// Ideally, this should be in an environment variable like process.env.SESSION_SECRET
const secretKey = process.env.SESSION_SECRET || 'sunris3_cl1n1c_s3cur3_k3y_2026'
const key = new TextEncoder().encode(secretKey)

export type SessionPayload = {
  userId: string
  email: string
  role: UserRole
  expiresAt: string
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key)
}

export async function decrypt(session: string | undefined = '') {
  if (!session) return null
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch (error) {
    return null
  }
}

export async function createSession(userId: string, email: string, role: UserRole) {
  const expiresAtDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
  const expiresAt = expiresAtDate.toISOString()
  
  const session = await encrypt({ userId, email, role, expiresAt })
  const cookieStore = await cookies()

  // Set role-specific cookie so multiple roles can log in simultaneously
  cookieStore.set(`session_${role.toLowerCase()}`, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAtDate,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession(role?: string) {
  const cookieStore = await cookies()
  if (role) {
    cookieStore.delete(`session_${role.toLowerCase()}`)
  } else {
    cookieStore.delete('session_kasir')
    cookieStore.delete('session_apoteker')
    cookieStore.delete('session_owner')
  }
}

export async function verifySession(role?: string) {
  const cookieStore = await cookies()
  
  if (role) {
    const cookie = cookieStore.get(`session_${role.toLowerCase()}`)?.value
    const session = await decrypt(cookie)
    if (!session?.userId) return { isAuth: false }
    return { isAuth: true, userId: session.userId, role: session.role }
  }

  return { isAuth: false }
}
