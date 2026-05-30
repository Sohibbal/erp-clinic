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
  description?: string
  basePrice: number
  promoActive?: boolean
  promoType?: DiscountType
  promoValue?: number
  linkedProductIds?: string[]
  doctorFeeType?: DiscountType
  doctorFeeValue?: number
  therapistFeeType?: DiscountType
  therapistFeeValue?: number
}) {
  const service = await prisma.service.create({
    data: {
      name: data.name,
      description: data.description || null,
      basePrice: data.basePrice,
      isActive: true,
      doctorFeeType: data.doctorFeeType || null,
      doctorFeeValue: data.doctorFeeValue || 0,
      therapistFeeType: data.therapistFeeType || null,
      therapistFeeValue: data.therapistFeeValue || 0,
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
      ...(data.linkedProductIds && data.linkedProductIds.length > 0
        ? {
            linkedProducts: {
              create: data.linkedProductIds.map((productId) => ({
                product: { connect: { id: productId } },
                defaultQty: 1, // Default quantity, cashier will override
              })),
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
    description?: string
    basePrice?: number
    promoActive?: boolean
    promoType?: DiscountType
    promoValue?: number
    linkedProductIds?: string[]
    doctorFeeType?: DiscountType
    doctorFeeValue?: number
    therapistFeeType?: DiscountType
    therapistFeeValue?: number
  }
) {
  const service = await prisma.service.update({
    where: { id },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.basePrice !== undefined ? { basePrice: data.basePrice } : {}),
      ...(data.doctorFeeType !== undefined ? { doctorFeeType: data.doctorFeeType } : {}),
      ...(data.doctorFeeValue !== undefined ? { doctorFeeValue: data.doctorFeeValue } : {}),
      ...(data.therapistFeeType !== undefined ? { therapistFeeType: data.therapistFeeType } : {}),
      ...(data.therapistFeeValue !== undefined ? { therapistFeeValue: data.therapistFeeValue } : {}),
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

  // Update linked products
  if (data.linkedProductIds !== undefined) {
    // Delete existing mappings
    await prisma.serviceProduct.deleteMany({
      where: { serviceId: id },
    })

    // Recreate mappings if there are any
    if (data.linkedProductIds.length > 0) {
      await prisma.serviceProduct.createMany({
        data: data.linkedProductIds.map((productId) => ({
          serviceId: id,
          productId: productId,
          defaultQty: 1, // Default quantity, cashier will override
        })),
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
