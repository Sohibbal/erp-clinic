'use server'

import prisma from '@/lib/prisma'

// ============================================================
// CLINIC — Server Actions (Profile & Operating Hours)
// ============================================================

export async function getClinicProfile() {
  const clinic = await prisma.clinic.findFirst({
    include: { operatingHours: { orderBy: { dayOfWeek: 'asc' } } },
  })

  if (!clinic) {
    // Create default clinic if none exists
    return prisma.clinic.create({
      data: {
        name: 'Sunrise Clinic',
        address: 'Jl. Sudirman No. 123, Jakarta Selatan, 12930',
        phone: '+62 21-5555-8899',
        email: 'info@sunrise-clinic.co.id',
        licenseNumber: 'SIP-2023-JKT-00412',
        operatingHours: {
          create: [
            { dayOfWeek: 'Senin', openTime: '09:00', closeTime: '18:00', isOpen: true },
            { dayOfWeek: 'Selasa', openTime: '09:00', closeTime: '18:00', isOpen: true },
            { dayOfWeek: 'Rabu', openTime: '09:00', closeTime: '18:00', isOpen: true },
            { dayOfWeek: 'Kamis', openTime: '09:00', closeTime: '18:00', isOpen: true },
            { dayOfWeek: 'Jumat', openTime: '09:00', closeTime: '18:00', isOpen: true },
            { dayOfWeek: 'Sabtu', openTime: '10:00', closeTime: '15:00', isOpen: true },
            { dayOfWeek: 'Minggu', openTime: '00:00', closeTime: '00:00', isOpen: false },
          ],
        },
      },
      include: { operatingHours: true },
    })
  }

  return clinic
}

export async function updateClinicProfile(data: {
  name: string
  address: string
  phone: string
  email: string
}) {
  const clinic = await prisma.clinic.findFirst()
  if (!clinic) throw new Error('Clinic not found')

  const updated = await prisma.clinic.update({
    where: { id: clinic.id },
    data,
  })

  await prisma.auditLog.create({
    data: {
      action: 'UPDATE',
      entityType: 'Clinic',
      entityId: clinic.id,
      oldValue: JSON.stringify(clinic),
      newValue: JSON.stringify(updated),
    },
  })

  return updated
}

export async function updateOperatingHours(
  hours: {
    dayOfWeek: string
    openTime: string
    closeTime: string
    isOpen: boolean
  }[]
) {
  const clinic = await prisma.clinic.findFirst()
  if (!clinic) throw new Error('Clinic not found')

  // Upsert each day
  for (const hour of hours) {
    await prisma.operatingHours.upsert({
      where: {
        clinicId_dayOfWeek: {
          clinicId: clinic.id,
          dayOfWeek: hour.dayOfWeek,
        },
      },
      update: {
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isOpen: hour.isOpen,
      },
      create: {
        clinicId: clinic.id,
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isOpen: hour.isOpen,
      },
    })
  }

  return prisma.operatingHours.findMany({
    where: { clinicId: clinic.id },
  })
}
