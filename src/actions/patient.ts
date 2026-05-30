'use server'

import prisma from '@/lib/prisma'
import type { Gender, PatientStatus } from '@/generated/prisma/client'

// ============================================================
// PATIENT — Server Actions
// ============================================================

export async function getPatients(search?: string) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { noRM: { contains: search, mode: 'insensitive' as const } },
          { nik: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
        ],
      }
    : {}

  const patients = await prisma.patient.findMany({
    where,
    include: {
      queues: {
        include: { doctor: { select: { name: true } }, therapist: { select: { name: true } } }
      },
      medicalRecords: {
        orderBy: { visitDate: 'desc' },
        include: { doctor: { select: { name: true } } },
      },
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          items: {
            include: {
              service: { select: { name: true } },
              product: { select: { name: true } }
            }
          }
        }
      }
    },
    orderBy: { registeredAt: 'desc' },
  })

  return JSON.parse(JSON.stringify(patients))
}

export async function getPatientByNoRM(noRM: string) {
  const patient = await prisma.patient.findUnique({
    where: { noRM },
    include: {
      queues: {
        include: { doctor: { select: { name: true } }, therapist: { select: { name: true } } }
      },
      medicalRecords: {
        orderBy: { visitDate: 'asc' },
        include: { 
          doctor: { select: { name: true } },
          transaction: { select: { createdAt: true } }
        },
      },
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          items: {
            include: {
              service: { select: { name: true } },
              product: { select: { name: true } }
            }
          }
        }
      }
    },
  })

  return JSON.parse(JSON.stringify(patient))
}

export async function createPatient(data: {
  nik: string
  name: string
  gender: Gender
  phone: string
  dateOfBirth?: string
  allergies?: string
  guardianName?: string
  occupation?: string
  address?: string
}) {
  // Auto-generate noRM
  const lastPatient = await prisma.patient.findFirst({
    orderBy: { noRM: 'desc' }, // Order by noRM to get the highest one, assuming format RM-XXXX
    select: { noRM: true }
  })
  
  let nextRmNumber = 1
  if (lastPatient && lastPatient.noRM.startsWith('RM-')) {
    const lastNum = parseInt(lastPatient.noRM.replace('RM-', ''), 10)
    if (!isNaN(lastNum)) {
      nextRmNumber = lastNum + 1
    }
  }
  
  // Format as RM-000X
  const noRM = `RM-${nextRmNumber.toString().padStart(4, '0')}`

  const patient = await prisma.patient.create({
    data: {
      noRM: noRM,
      nik: data.nik,
      name: data.name,
      gender: data.gender,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      allergies: data.allergies || null,
      guardianName: data.guardianName || null,
      occupation: data.occupation || null,
      address: data.address || null,
      status: 'NEW_PATIENT',
    },
  })

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'Patient',
      entityId: patient.id,
      newValue: JSON.stringify(patient),
    },
  })

  return patient
}

export async function updatePatientStatus(id: string, status: PatientStatus) {
  return prisma.patient.update({
    where: { id },
    data: { status },
  })
}
