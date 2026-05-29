'use server'

import prisma from '@/lib/prisma'
import type { StockStatus, StockMovementType } from '@/generated/prisma/client'

// ============================================================
// PRODUCT / INVENTORY — Server Actions
// ============================================================

export async function getProducts(filters?: {
  search?: string
  status?: StockStatus | 'ALL'
  category?: string
}) {
  const where: Record<string, unknown> = {}

  if (filters?.search) {
    where.name = { contains: filters.search, mode: 'insensitive' }
  }
  if (filters?.status && filters.status !== 'ALL') {
    where.stockStatus = filters.status
  }
  if (filters?.category) {
    where.category = filters.category
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return JSON.parse(JSON.stringify(products))
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      stockMovements: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { performedBy: { select: { name: true } } },
      },
      serviceProducts: {
        include: { service: { select: { name: true } } },
      },
    },
  })

  return JSON.parse(JSON.stringify(product))
}

export async function createProduct(data: {
  name: string
  category: string
  stock: number
  price: number
  batchNo?: string
  expiryDate?: string
}) {
  const stockStatus: StockStatus =
    data.stock === 0 ? 'OUT_OF_STOCK' : data.stock <= 5 ? 'LOW_STOCK' : 'IN_STOCK'

  const product = await prisma.product.create({
    data: {
      name: data.name,
      category: data.category,
      stock: data.stock,
      price: data.price,
      stockStatus,
      icon: 'medication',
      batchNo: data.batchNo || `NEW-${Date.now()}`,
      lastRestock: new Date(),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
    },
  })

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'Product',
      entityId: product.id,
      newValue: JSON.stringify(product),
    },
  })

  return JSON.parse(JSON.stringify(product))
}

export async function updateProduct(
  id: string,
  data: { name?: string; category?: string; stock?: number; price?: number }
) {
  const oldProduct = await prisma.product.findUnique({ where: { id } })

  let stockStatus: StockStatus | undefined
  if (data.stock !== undefined) {
    stockStatus =
      data.stock === 0 ? 'OUT_OF_STOCK' : data.stock <= 5 ? 'LOW_STOCK' : 'IN_STOCK'
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      ...(stockStatus ? { stockStatus } : {}),
    },
  })

  await prisma.auditLog.create({
    data: {
      action: 'UPDATE',
      entityType: 'Product',
      entityId: id,
      oldValue: JSON.stringify(oldProduct),
      newValue: JSON.stringify(product),
    },
  })

  return JSON.parse(JSON.stringify(product))
}

export async function restockProduct(
  productId: string,
  quantity: number,
  performedById?: string
) {
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) throw new Error('Product not found')

  const newStock = product.stock + quantity

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      stock: newStock,
      stockStatus: newStock > 5 ? 'IN_STOCK' : newStock > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK',
      lastRestock: new Date(),
    },
  })

  await prisma.stockMovement.create({
    data: {
      productId,
      performedById: performedById || null,
      movementType: 'RESTOCK',
      quantity,
      stockBefore: product.stock,
      stockAfter: newStock,
      referenceNote: `Manual restock +${quantity} units`,
    },
  })

  return JSON.parse(JSON.stringify(updated))
}

export async function recordStockMovement(data: {
  productId: string
  movementType: StockMovementType
  quantity: number
  performedById?: string
  referenceNote?: string
}) {
  const product = await prisma.product.findUnique({ where: { id: data.productId } })
  if (!product) throw new Error('Product not found')

  const isDeduction = ['SALE', 'USAGE', 'EXPIRED'].includes(data.movementType)
  const newStock = isDeduction
    ? Math.max(0, product.stock - data.quantity)
    : product.stock + data.quantity

  await prisma.product.update({
    where: { id: data.productId },
    data: {
      stock: newStock,
      stockStatus: newStock === 0 ? 'OUT_OF_STOCK' : newStock <= 5 ? 'LOW_STOCK' : 'IN_STOCK',
    },
  })

  return prisma.stockMovement.create({
    data: {
      productId: data.productId,
      performedById: data.performedById || null,
      movementType: data.movementType,
      quantity: data.quantity,
      stockBefore: product.stock,
      stockAfter: newStock,
      referenceNote: data.referenceNote || null,
    },
  })
}
