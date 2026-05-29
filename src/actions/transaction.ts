'use server'

import prisma from '@/lib/prisma'
import type { TransactionStatus, PaymentMethod, TransactionType } from '@/generated/prisma/client'

// ============================================================
// TRANSACTION — Server Actions
// ============================================================

export async function getTransactions(filters?: {
  status?: TransactionStatus
  dateFrom?: string
  dateTo?: string
  search?: string
  transactionType?: TransactionType
}) {
  const where: Record<string, unknown> = {}

  if (filters?.status) where.status = filters.status
  if (filters?.transactionType) where.transactionType = filters.transactionType
  if (filters?.search) {
    where.OR = [
      { invoiceId: { contains: filters.search, mode: 'insensitive' } },
      { patient: { name: { contains: filters.search, mode: 'insensitive' } } },
    ]
  }
  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {
      ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      patient: { select: { name: true, noRM: true } },
      cashier: { select: { email: true } },
      items: {
        include: {
          service: { select: { name: true } },
          product: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  
  return JSON.parse(JSON.stringify(transactions))
}

export async function getTransactionById(id: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      patient: true,
      cashier: { select: { email: true } },
      items: {
        include: {
          service: { select: { name: true, basePrice: true } },
          product: { select: { name: true, price: true } },
        },
      },
    },
  })
  
  return JSON.parse(JSON.stringify(transaction))
}

export async function createTransaction(data: {
  patientId?: string
  cashierId?: string
  transactionType: TransactionType
  items: {
    itemType: 'SERVICE' | 'PRODUCT'
    serviceId?: string
    productId?: string
    itemName: string
    quantity: number
    unitPrice: number
  }[]
  discountAmount?: number
}) {
  const subtotal = data.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const discount = data.discountAmount || 0
  const totalAmount = subtotal - discount

  const invoiceId = `#INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-3)}`

  const transaction = await prisma.transaction.create({
    data: {
      invoiceId,
      patientId: data.patientId || null,
      cashierId: data.cashierId || null,
      transactionType: data.transactionType,
      subtotal,
      discountAmount: discount,
      totalAmount,
      status: 'PENDING',
      items: {
        create: data.items.map(item => ({
          itemType: item.itemType,
          serviceId: item.serviceId || null,
          productId: item.productId || null,
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.unitPrice * item.quantity,
        })),
      },
    },
    include: { items: true },
  })

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'Transaction',
      entityId: transaction.id,
      newValue: JSON.stringify({ invoiceId, totalAmount, status: 'PENDING' }),
    },
  })

  return JSON.parse(JSON.stringify(transaction))
}

export async function processPayment(transactionId: string, data: {
  paymentMethod: PaymentMethod
  items: {
    itemType: 'SERVICE' | 'PRODUCT'
    serviceId?: string
    productId?: string
    itemName: string
    quantity: number
    unitPrice: number
  }[]
}) {
  const oldTx = await prisma.transaction.findUnique({ where: { id: transactionId } })
  if (!oldTx) throw new Error('Transaction not found')

  const subtotal = data.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  // First, create the items (clean existing items if any)
  await prisma.transactionItem.deleteMany({ where: { transactionId } })

  const transaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: 'PAID',
      paymentMethod: data.paymentMethod,
      paidAt: new Date(),
      subtotal,
      totalAmount: subtotal - Number(oldTx.discountAmount || 0),
      items: {
        create: data.items.map(item => ({
          itemType: item.itemType,
          serviceId: item.serviceId || null,
          productId: item.productId || null,
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.unitPrice * item.quantity,
        })),
      },
    },
    include: { items: true },
  })

  // Deduct stock for product items
  for (const item of transaction.items) {
    if (item.productId) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity)
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: newStock,
            stockStatus: newStock === 0 ? 'OUT_OF_STOCK' : newStock <= 5 ? 'LOW_STOCK' : 'IN_STOCK',
          },
        })

        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            movementType: 'SALE',
            quantity: item.quantity,
            stockBefore: product.stock,
            stockAfter: newStock,
            referenceNote: `Transaction ${transaction.invoiceId}`,
          },
        })
      }
    }
  }

  await prisma.auditLog.create({
    data: {
      action: 'UPDATE',
      entityType: 'Transaction',
      entityId: transactionId,
      oldValue: JSON.stringify({ status: oldTx?.status }),
      newValue: JSON.stringify({ status: 'PAID', paymentMethod: data.paymentMethod }),
    },
  })

  return JSON.parse(JSON.stringify(transaction))
}

export async function getTransactionStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [todayPaid, todayPending, todayRevenue] = await Promise.all([
    prisma.transaction.count({
      where: { status: 'PAID', createdAt: { gte: today } },
    }),
    prisma.transaction.count({
      where: { status: 'PENDING', createdAt: { gte: today } },
    }),
    prisma.transaction.aggregate({
      where: { status: 'PAID', createdAt: { gte: today } },
      _sum: { totalAmount: true },
    }),
  ])

  return {
    todayPaidCount: todayPaid,
    todayPendingCount: todayPending,
    todayRevenue: Number(todayRevenue._sum.totalAmount || 0),
    todayTotalTransactions: todayPaid + todayPending,
  }
}
