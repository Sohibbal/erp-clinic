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

  return prisma.patient.findMany({
    where,
    include: {
      medicalRecords: {
        orderBy: { visitDate: 'desc' },
        include: { doctor: { select: { name: true } } },
      },
    },
    orderBy: { registeredAt: 'desc' },
  })
}

export async function getPatientByNoRM(noRM: string) {
  return prisma.patient.findUnique({
    where: { noRM },
    include: {
      medicalRecords: {
        orderBy: { visitDate: 'desc' },
        include: { doctor: { select: { name: true } } },
      },
    },
  })
}

export async function createPatient(data: {
  noRM: string
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
  const patient = await prisma.patient.create({
    data: {
      noRM: data.noRM,
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
