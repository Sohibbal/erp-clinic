'use server'

import prisma from '@/lib/prisma'
import type { QueueStatus } from '@/generated/prisma/client'

// ============================================================
// QUEUE — Server Actions
// ============================================================

export async function getTodayQueue() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return prisma.queue.findMany({
    where: {
      queueDate: { gte: today, lt: tomorrow },
    },
    include: {
      patient: { select: { name: true, noRM: true } },
      doctor: { select: { name: true } },
      therapist: { select: { name: true } },
    },
    orderBy: { queueNumber: 'asc' },
  })
}

export async function addToQueue(data: {
  patientId: string
  doctorId?: string
  therapistId?: string
  serviceName: string
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Get the next queue number for today
  const lastQueue = await prisma.queue.findFirst({
    where: { queueDate: { gte: today, lt: tomorrow } },
    orderBy: { queueNumber: 'desc' },
  })

  const queueNumber = (lastQueue?.queueNumber || 0) + 1

  const queue = await prisma.queue.create({
    data: {
      patientId: data.patientId,
      doctorId: data.doctorId || null,
      therapistId: data.therapistId || null,
      serviceName: data.serviceName,
      status: 'WAITING',
      queueNumber,
      queueDate: new Date(),
    },
    include: {
      patient: { select: { name: true, noRM: true } },
      doctor: { select: { name: true } },
    },
  })

  // Create an empty pending transaction for the billing page
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const dateStr = String(now.getDate()).padStart(2, '0')
  const datePrefix = `${year}${month}${dateStr}`

  const todayCount = await prisma.transaction.count({
    where: {
      createdAt: {
        gte: today,
        lte: tomorrow,
      },
    },
  })

  const invoiceId = `#INV-${datePrefix}-${todayCount + 1}`
  await prisma.transaction.create({
    data: {
      invoiceId,
      patientId: data.patientId,
      transactionType: 'CLINIC_SERVICE',
      subtotal: 0,
      totalAmount: 0,
      status: 'PENDING',
    }
  })

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'Queue',
      entityId: queue.id,
      newValue: JSON.stringify({ patientId: data.patientId, queueNumber, status: 'WAITING' }),
    },
  })

  return queue
}

export async function updateQueueStatus(id: string, status: QueueStatus) {
  return prisma.queue.update({
    where: { id },
    data: { status },
  })
}
