'use server'

import prisma from '@/lib/prisma'

// ============================================================
// DASHBOARD — Server Actions (Aggregation queries)
// ============================================================

export async function getOwnerDashboardStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [
    totalPatients,
    totalEmployees,
    totalProducts,
    totalRevenue,
    monthlyRevenue,
    paidTransactions,
    pendingTransactions,
    outOfStock,
    lowStock,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.employee.count({ where: { status: 'ACTIVE' } }),
    prisma.product.count(),
    prisma.transaction.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true },
    }),
    prisma.transaction.aggregate({
      where: { status: 'PAID', createdAt: { gte: thisMonth } },
      _sum: { totalAmount: true },
    }),
    prisma.transaction.count({ where: { status: 'PAID' } }),
    prisma.transaction.count({ where: { status: 'PENDING' } }),
    prisma.product.count({ where: { stockStatus: 'OUT_OF_STOCK' } }),
    prisma.product.count({ where: { stockStatus: 'LOW_STOCK' } }),
  ])

  return {
    totalPatients,
    totalEmployees,
    totalProducts,
    totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
    monthlyRevenue: Number(monthlyRevenue._sum.totalAmount || 0),
    paidTransactions,
    pendingTransactions,
    outOfStock,
    lowStock,
  }
}

export async function getRevenueReport(filters?: {
  method?: string
  status?: string
  search?: string
}) {
  const where: Record<string, unknown> = {}

  if (filters?.method && filters.method !== 'All') {
    where.paymentMethod = filters.method
  }
  if (filters?.status && filters.status !== 'All') {
    where.status = filters.status === 'Paid' ? 'PAID' : 'PENDING'
  }
  if (filters?.search) {
    where.OR = [
      { invoiceId: { contains: filters.search, mode: 'insensitive' } },
      { patient: { name: { contains: filters.search, mode: 'insensitive' } } },
    ]
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      patient: { select: { name: true } },
      items: { select: { itemName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalRevenue = transactions
    .filter(tx => tx.status === 'PAID')
    .reduce((sum, tx) => sum + Number(tx.totalAmount), 0)

  const totalPending = transactions
    .filter(tx => tx.status === 'PENDING')
    .reduce((sum, tx) => sum + Number(tx.totalAmount), 0)

  return {
    transactions: JSON.parse(JSON.stringify(transactions)),
    totalRevenue,
    totalPending,
    paidCount: transactions.filter(tx => tx.status === 'PAID').length,
    pendingCount: transactions.filter(tx => tx.status === 'PENDING').length,
  }
}

export async function getGlobalReport() {
  const [
    paidTransactions,
    pendingRevenue,
    totalProducts,
    totalStockItems,
    totalAssetValue,
    outOfStock,
    lowStock,
    totalPatients,
    activeStaff,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.transaction.aggregate({
      where: { status: 'PENDING' },
      _sum: { totalAmount: true },
    }),
    prisma.product.count(),
    prisma.product.aggregate({ _sum: { stock: true } }),
    // Total asset value requires raw SQL or application-level calc
    prisma.product.findMany({ select: { stock: true, price: true } }),
    prisma.product.count({ where: { stockStatus: 'OUT_OF_STOCK' } }),
    prisma.product.count({ where: { stock: { gt: 0, lte: 10 } } }),
    prisma.patient.count(),
    prisma.employee.count({ where: { status: 'ACTIVE' } }),
  ])

  const assetValue = totalAssetValue.reduce(
    (sum, p) => sum + p.stock * Number(p.price),
    0
  )

  return {
    totalRevenue: Number(paidTransactions._sum.totalAmount || 0),
    paidCount: paidTransactions._count,
    pendingRevenue: Number(pendingRevenue._sum.totalAmount || 0),
    totalProducts,
    totalStockItems: Number(totalStockItems._sum.stock || 0),
    totalAssetValue: Number(assetValue),
    outOfStock,
    lowStock,
    totalPatients,
    activeStaff,
  }
}
