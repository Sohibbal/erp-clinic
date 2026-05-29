'use server'

import prisma from '@/lib/prisma'
import type { DiscountType } from '@/generated/prisma/client'

// ============================================================
// SERVICE — Server Actions
// ============================================================

export async function getServices(search?: string) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { id: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const services = await prisma.service.findMany({
    where,
    include: {
      linkedProducts: {
        include: {
          product: {
            select: { name: true, stock: true, stockStatus: true, price: true },
          },
        },
      },
      promotions: {
        where: { isActive: true },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return JSON.parse(JSON.stringify(services))
}

export async function getServiceById(id: string) {
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      linkedProducts: {
        include: {
          product: true,
        },
      },
      promotions: true,
    },
  })

  return JSON.parse(JSON.stringify(service))
}

export async function createService(data: {
  name: string
  basePrice: number
  promoActive?: boolean
  promoType?: DiscountType
  promoValue?: number
}) {
  const service = await prisma.service.create({
    data: {
      name: data.name,
      basePrice: data.basePrice,
      isActive: true,
      ...(data.promoActive
        ? {
            promotions: {
              create: {
                isActive: true,
                discountType: data.promoType || 'PERCENTAGE',
                discountValue: data.promoValue || 0,
              },
            },
          }
        : {}),
    },
  })

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'Service',
      entityId: service.id,
      newValue: JSON.stringify(service),
    },
  })

  return service
}

export async function updateService(
  id: string,
  data: {
    name?: string
    basePrice?: number
    promoActive?: boolean
    promoType?: DiscountType
    promoValue?: number
  }
) {
  const service = await prisma.service.update({
    where: { id },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.basePrice !== undefined ? { basePrice: data.basePrice } : {}),
    },
  })

  // Update or create promotion
  if (data.promoActive !== undefined) {
    const existingPromo = await prisma.promotion.findFirst({
      where: { serviceId: id },
      orderBy: { createdAt: 'desc' },
    })

    if (existingPromo) {
      await prisma.promotion.update({
        where: { id: existingPromo.id },
        data: {
          isActive: data.promoActive,
          ...(data.promoType ? { discountType: data.promoType } : {}),
          ...(data.promoValue !== undefined ? { discountValue: data.promoValue } : {}),
        },
      })
    } else if (data.promoActive) {
      await prisma.promotion.create({
        data: {
          serviceId: id,
          isActive: true,
          discountType: data.promoType || 'PERCENTAGE',
          discountValue: data.promoValue || 0,
        },
      })
    }
  }

  return JSON.parse(JSON.stringify(service))
}

export async function deleteService(id: string) {
  const service = await prisma.service.findUnique({ where: { id } })

  await prisma.auditLog.create({
    data: {
      action: 'DELETE',
      entityType: 'Service',
      entityId: id,
      oldValue: JSON.stringify(service),
    },
  })

  const deleted = await prisma.service.delete({ where: { id } })
  return JSON.parse(JSON.stringify(deleted))
}
