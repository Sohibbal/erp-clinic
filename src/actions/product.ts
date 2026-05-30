'use server'

import prisma from '@/lib/prisma'
import type { StockStatus, StockMovementType } from '@/generated/prisma/client'

// ============================================================
// PRODUCT / INVENTORY — Server Actions
// ============================================================

function calculateStockStatus(stock: number, expiryDate: Date | null): StockStatus {
  if (stock === 0) return 'OUT_OF_STOCK';
  
  if (expiryDate) {
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 90) return 'EXPIRING';
  }
  
  if (stock <= 5) return 'LOW_STOCK';
  return 'IN_STOCK';
}

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

  // Auto-update EXPIRING status on fetch if it changed
  for (const product of products) {
    const correctStatus = calculateStockStatus(product.stock, product.expiryDate);
    if (product.stockStatus !== correctStatus) {
      await prisma.product.update({
        where: { id: product.id },
        data: { stockStatus: correctStatus }
      });
      product.stockStatus = correctStatus;
    }
  }

  // Refilter in memory if status filter was applied since we just updated statuses
  const finalProducts = filters?.status && filters.status !== 'ALL' 
    ? products.filter(p => p.stockStatus === filters.status)
    : products;

  return JSON.parse(JSON.stringify(finalProducts))
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
  const expiryDateObj = data.expiryDate ? new Date(data.expiryDate) : null;
  const stockStatus = calculateStockStatus(data.stock, expiryDateObj);

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
      expiryDate: expiryDateObj,
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

  if (data.stock > 0) {
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        movementType: 'RESTOCK',
        quantity: data.stock,
        stockBefore: 0,
        stockAfter: data.stock,
        referenceNote: 'Initial stock on creation',
      },
    })
  }

  return JSON.parse(JSON.stringify(product))
}

export async function updateProduct(
  id: string,
  data: { name?: string; category?: string; stock?: number; price?: number; expiryDate?: string }
) {
  const oldProduct = await prisma.product.findUnique({ where: { id } })
  if (!oldProduct) throw new Error('Product not found')

  const currentStock = data.stock !== undefined ? data.stock : oldProduct.stock;
  const currentExpiry = data.expiryDate !== undefined ? (data.expiryDate ? new Date(data.expiryDate) : null) : oldProduct.expiryDate;
  
  const stockStatus = calculateStockStatus(currentStock, currentExpiry);

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      expiryDate: data.expiryDate !== undefined ? (data.expiryDate ? new Date(data.expiryDate) : null) : undefined,
      stockStatus,
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

  if (oldProduct && data.stock !== undefined && data.stock !== oldProduct.stock) {
    const diff = data.stock - oldProduct.stock;
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        movementType: 'ADJUSTMENT',
        quantity: Math.abs(diff),
        stockBefore: oldProduct.stock,
        stockAfter: data.stock,
        referenceNote: 'Manual stock adjustment',
      },
    })
  }

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
      stockStatus: calculateStockStatus(newStock, product.expiryDate),
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
      stockStatus: calculateStockStatus(newStock, product.expiryDate),
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

export async function getAllStockMovements() {
  const movements = await prisma.stockMovement.findMany({
    include: {
      product: { select: { name: true } },
      performedBy: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  return JSON.parse(JSON.stringify(movements))
}
