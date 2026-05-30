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
    totalRevenueAgg,
    monthlyRevenueAgg,
    paidTransactionsCount,
    pendingTransactions,
    outOfStock,
    lowStock,
    allPaidTransactions,
    thisMonthPaidTransactions
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
    prisma.transaction.findMany({
      where: { status: 'PAID' },
      include: { items: { include: { service: { select: { name: true, doctorFeeType: true, doctorFeeValue: true, therapistFeeType: true, therapistFeeValue: true } } } } }
    }),
    prisma.transaction.findMany({
      where: { status: 'PAID', createdAt: { gte: thisMonth } },
      include: { items: { include: { service: { select: { doctorFeeType: true, doctorFeeValue: true, therapistFeeType: true, therapistFeeValue: true } } } } }
    }),
  ])

  // Helper to calculate expense for a list of transactions
  const calculateExpense = (txs: any[]) => {
    let expense = 0;
    for (const tx of txs) {
      for (const item of tx.items) {
        if (item.service) {
          const s = item.service;
          const basePrice = Number(item.unitPrice) * item.quantity;
          let docFee = 0, therFee = 0;
          if (s.doctorFeeType === 'PERCENTAGE') docFee = basePrice * (Number(s.doctorFeeValue || 0) / 100);
          else if (s.doctorFeeType === 'FIXED') docFee = Number(s.doctorFeeValue || 0) * item.quantity;
          if (s.therapistFeeType === 'PERCENTAGE') therFee = basePrice * (Number(s.therapistFeeValue || 0) / 100);
          else if (s.therapistFeeType === 'FIXED') therFee = Number(s.therapistFeeValue || 0) * item.quantity;
          expense += (docFee + therFee);
        }
      }
    }
    return expense;
  };

  const totalExpense = calculateExpense(allPaidTransactions);
  const monthlyExpense = calculateExpense(thisMonthPaidTransactions);
  const totalRevenue = Number(totalRevenueAgg._sum.totalAmount || 0);
  const monthlyRevenue = Number(monthlyRevenueAgg._sum.totalAmount || 0);

  // Calculate Top Service and Top Payment Method
  const serviceCounts: Record<string, number> = {};
  const paymentCounts: Record<string, number> = {};
  
  for (const tx of allPaidTransactions) {
    if (tx.paymentMethod) {
      paymentCounts[tx.paymentMethod] = (paymentCounts[tx.paymentMethod] || 0) + 1;
    }
    for (const item of tx.items) {
      if (item.service) {
        serviceCounts[item.service.name] = (serviceCounts[item.service.name] || 0) + item.quantity;
      }
    }
  }

  let topService = "Belum Ada";
  let maxServiceCount = 0;
  for (const [name, count] of Object.entries(serviceCounts)) {
    if (count > maxServiceCount) {
      maxServiceCount = count;
      topService = name;
    }
  }

  let topPayment = "Belum Ada";
  let maxPaymentCount = 0;
  for (const [method, count] of Object.entries(paymentCounts)) {
    if (count > maxPaymentCount) {
      maxPaymentCount = count;
      topPayment = method.replace(/_/g, ' ');
    }
  }

  return {
    totalPatients,
    totalEmployees,
    totalProducts,
    totalRevenue,
    monthlyRevenue,
    totalExpense,
    monthlyExpense,
    totalProfit: totalRevenue - totalExpense,
    monthlyProfit: monthlyRevenue - monthlyExpense,
    paidTransactions: paidTransactionsCount,
    pendingTransactions,
    outOfStock,
    lowStock,
    topService,
    topServiceCount: maxServiceCount,
    topPayment,
    topPaymentCount: maxPaymentCount,
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

export async function getRevenueChartData(year?: number) {
  const currentYear = year || new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: {
      status: 'PAID',
      createdAt: {
        gte: startOfYear,
        lte: endOfYear
      }
    },
    include: {
      items: {
        include: {
          service: {
            select: {
              doctorFeeType: true,
              doctorFeeValue: true,
              therapistFeeType: true,
              therapistFeeValue: true
            }
          }
        }
      }
    }
  });

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const monthlyData = monthNames.map(name => ({ name, pemasukan: 0, pengeluaran: 0 }));

  for (const tx of transactions) {
    const monthIndex = new Date(tx.createdAt).getMonth();
    monthlyData[monthIndex].pemasukan += Number(tx.totalAmount || 0);
    
    let totalFeeExpense = 0;
    for (const item of tx.items) {
      if (item.service) {
        const s = item.service;
        const basePrice = Number(item.unitPrice) * item.quantity;
        
        let doctorFee = 0;
        if (s.doctorFeeType === 'PERCENTAGE') {
          doctorFee = basePrice * (Number(s.doctorFeeValue || 0) / 100);
        } else if (s.doctorFeeType === 'FIXED') {
          doctorFee = Number(s.doctorFeeValue || 0) * item.quantity;
        }

        let therapistFee = 0;
        if (s.therapistFeeType === 'PERCENTAGE') {
          therapistFee = basePrice * (Number(s.therapistFeeValue || 0) / 100);
        } else if (s.therapistFeeType === 'FIXED') {
          therapistFee = Number(s.therapistFeeValue || 0) * item.quantity;
        }

        totalFeeExpense += (doctorFee + therapistFee);
      }
    }

    monthlyData[monthIndex].pengeluaran += totalFeeExpense;
  }

  return monthlyData;
}
