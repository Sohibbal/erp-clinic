'use server'

import prisma from '@/lib/prisma'
import type { UserRole } from '@/generated/prisma/client'

// ============================================================
// AUTH — Server Actions
// ============================================================

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      employee: { select: { name: true, imageUrl: true } },
    },
  })

  if (!user || !user.isActive) {
    return { success: false, error: 'Email tidak ditemukan atau akun tidak aktif.' }
  }

  const hashedInput = await hashPassword(password)
  if (hashedInput !== user.passwordHash) {
    return { success: false, error: 'Kata sandi salah.' }
  }

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
    },
  })

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeName: user.employee?.name || null,
      employeeImage: user.employee?.imageUrl || null,
    },
  }
}

export async function getSystemAccounts() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      employee: { select: { name: true } },
    },
    orderBy: { role: 'asc' },
  })
}

export async function resetPassword(userId: string, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashedPassword },
  })

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'RESET_PASSWORD',
      entityType: 'User',
      entityId: userId,
    },
  })

  return { success: true }
}

export async function createUser(data: {
  email: string
  password: string
  role: UserRole
  employeeId?: string
}) {
  const hashedPassword = await hashPassword(data.password)

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: hashedPassword,
      role: data.role,
      employeeId: data.employeeId || null,
    },
  })

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'User',
      entityId: user.id,
      newValue: JSON.stringify({ email: user.email, role: user.role }),
    },
  })

  return user
}
