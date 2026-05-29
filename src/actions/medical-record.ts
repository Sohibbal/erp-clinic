'use server'

import prisma from '@/lib/prisma'

// ============================================================
// MEDICAL RECORD — Server Actions
// ============================================================

export async function getMedicalRecordsByPatient(patientId: string) {
  return prisma.medicalRecord.findMany({
    where: { patientId },
    include: {
      doctor: { select: { name: true } },
      transaction: { select: { invoiceId: true } },
    },
    orderBy: { visitDate: 'desc' },
  })
}

export async function createMedicalRecord(data: {
  patientId: string
  doctorId?: string
  transactionId?: string
  anamnesis?: string
  diagnosis?: string
  treatment?: string
  notes?: string
}) {
  const record = await prisma.medicalRecord.create({
    data: {
      patientId: data.patientId,
      doctorId: data.doctorId || null,
      transactionId: data.transactionId || null,
      visitDate: new Date(),
      anamnesis: data.anamnesis || null,
      diagnosis: data.diagnosis || null,
      treatment: data.treatment || null,
      notes: data.notes || null,
    },
    include: {
      doctor: { select: { name: true } },
    },
  })

  // Update patient status to RETURNING after first visit
  await prisma.patient.update({
    where: { id: data.patientId },
    data: { status: 'RETURNING' },
  })

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'MedicalRecord',
      entityId: record.id,
      newValue: JSON.stringify(record),
    },
  })

  return record
}

export async function updateMedicalRecord(
  id: string,
  data: {
    anamnesis?: string
    diagnosis?: string
    treatment?: string
    notes?: string
  }
) {
  const oldRecord = await prisma.medicalRecord.findUnique({ where: { id } })

  const record = await prisma.medicalRecord.update({
    where: { id },
    data,
  })

  await prisma.auditLog.create({
    data: {
      action: 'UPDATE',
      entityType: 'MedicalRecord',
      entityId: id,
      oldValue: JSON.stringify(oldRecord),
      newValue: JSON.stringify(record),
    },
  })

  return record
}
