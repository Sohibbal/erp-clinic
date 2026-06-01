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
      patient: { 
        select: { 
          name: true, 
          noRM: true,
          queues: {
            include: { doctor: { select: { name: true } }, therapist: { select: { name: true } } }
          }
        } 
      },
      cashier: { select: { email: true } },
      items: {
        include: {
          service: { select: { name: true } },
          product: { select: { name: true } },
        },
      },
      medicalRecords: {
        include: { 
          doctor: { select: { name: true } },
          therapist: { select: { name: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  })
  
  return JSON.parse(JSON.stringify(transactions))
}

export async function getTransactionById(id: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      patient: {
        include: {
          queues: {
            include: { doctor: { select: { name: true } }, therapist: { select: { name: true } } }
          }
        }
      },
      cashier: { select: { email: true } },
      items: {
        include: {
          service: { select: { name: true, basePrice: true } },
          product: { select: { name: true, price: true } },
        },
      },
      medicalRecords: {
        include: { 
          doctor: { select: { name: true } },
          therapist: { select: { name: true } }
        }
      }
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
  discountAmount?: number
}) {
  const oldTx = await prisma.transaction.findUnique({ where: { id: transactionId } })
  if (!oldTx) throw new Error('Transaction not found')

  const subtotal = data.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const discountAmount = data.discountAmount ?? Number(oldTx.discountAmount || 0)

  // First, create the items (clean existing items if any)
  await prisma.transactionItem.deleteMany({ where: { transactionId } })

  // Pre-fetch services to calculate fees
  const serviceIds = data.items.filter(item => item.itemType === 'SERVICE' && item.serviceId).map(item => item.serviceId as string)
  const services = await prisma.service.findMany({ where: { id: { in: serviceIds } } })
  const serviceMap = new Map(services.map(s => [s.id, s]))

  const calculateFee = (feeType: string | null | undefined, feeValue: number | null | undefined, unitPrice: number, quantity: number) => {
    if (!feeType || !feeValue) return 0
    if (feeType === 'PERCENTAGE') {
      return (unitPrice * (Number(feeValue) / 100)) * quantity
    }
    return Number(feeValue) * quantity
  }

  const transaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: 'PAID',
      paymentMethod: data.paymentMethod,
      paidAt: new Date(),
      subtotal,
      discountAmount,
      totalAmount: Math.max(0, subtotal - discountAmount),
      items: {
        create: data.items.map(item => {
          let doctorFee = 0
          let therapistFee = 0
          if (item.itemType === 'SERVICE' && item.serviceId) {
            const service = serviceMap.get(item.serviceId)
            if (service) {
              doctorFee = calculateFee(service.doctorFeeType, Number(service.doctorFeeValue), item.unitPrice, item.quantity)
              therapistFee = calculateFee(service.therapistFeeType, Number(service.therapistFeeValue), item.unitPrice, item.quantity)
            }
          }

          return {
            itemType: item.itemType,
            serviceId: item.serviceId || null,
            productId: item.productId || null,
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.unitPrice * item.quantity,
            doctorFee,
            therapistFee,
          }
        }),
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

  // Auto-create an empty medical record for the transaction
  if (oldTx.patientId) {
    // Try to find the latest queue to link the doctor
    const latestQueue = await prisma.queue.findFirst({
      where: { patientId: oldTx.patientId },
      orderBy: { createdAt: 'desc' },
    });

    await prisma.medicalRecord.create({
      data: {
        patientId: oldTx.patientId,
        transactionId: transaction.id,
        doctorId: latestQueue?.doctorId || null,
        therapistId: latestQueue?.therapistId || null,
        visitDate: new Date(),
        anamnesis: null,
        diagnosis: null,
        treatment: null,
        notes: null
      }
    });
  }

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

export async function updateTransaction(id: string, data: {
  status?: string
  paymentMethod?: string
  totalAmount?: number
  discountAmount?: number
  notes?: string
}) {
  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      status: data.status as any,
      paymentMethod: data.paymentMethod as any,
      totalAmount: data.totalAmount,
      discountAmount: data.discountAmount,
      notes: data.notes
    }
  })
  
  await prisma.auditLog.create({
    data: {
      action: 'UPDATE',
      entityType: 'Transaction',
      entityId: id,
      oldValue: '',
      newValue: JSON.stringify(data),
    },
  })

  return JSON.parse(JSON.stringify(transaction))
}

export async function deleteTransaction(id: string) {
  // Restore stock if deleting a transaction that had products
  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: { items: true }
  })
  
  if (tx && tx.status === 'PAID') {
    for (const item of tx.items) {
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        })
      }
    }
  }

  // Related items usually cascade delete, but if not we can delete explicitly
  await prisma.transactionItem.deleteMany({ where: { transactionId: id } })
  await prisma.medicalRecord.deleteMany({ where: { transactionId: id } })
  
  const deleted = await prisma.transaction.delete({
    where: { id }
  })

  await prisma.auditLog.create({
    data: {
      action: 'DELETE',
      entityType: 'Transaction',
      entityId: id,
      oldValue: JSON.stringify({ invoiceId: tx?.invoiceId }),
      newValue: '',
    },
  })

  return JSON.parse(JSON.stringify(deleted))
}
