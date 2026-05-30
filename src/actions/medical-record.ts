'use server'

import prisma from '@/lib/prisma'

// ============================================================
// MEDICAL RECORD — Server Actions
// ============================================================

export async function getPatientsWithMedicalRecords() {
  const patients = await prisma.patient.findMany({
    where: {
      transactions: {
        some: {} // Has at least 1 transaction
      }
    },
    select: {
      id: true,
      name: true,
      noRM: true,
      nik: true,
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  return JSON.parse(JSON.stringify(patients))
}

export async function getMedicalRecordsByPatient(patientId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { patientId },
    include: {
      patient: {
        select: {
          queues: {
            include: { doctor: { select: { name: true } }, therapist: { select: { name: true } } }
          }
        }
      },
      medicalRecords: {
        include: { doctor: { select: { name: true } } }
      },
      items: {
        include: {
          service: { select: { name: true } },
          product: { select: { name: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const mappedRecords = transactions.map(tx => {
    const record = tx.medicalRecords[0];
    const services = tx.items.filter(i => i.itemType === 'SERVICE');
    const transactionDesc = services.length > 0
        ? services.map(i => i.service?.name || i.itemName).join(', ')
        : 'Hanya Pembelian Produk';

    const txTime = new Date(tx.createdAt).getTime();
    const matchedQueue = tx.patient?.queues?.reduce((closest: any, q: any) => {
      const qTime = new Date(q.createdAt).getTime();
      if (!closest || Math.abs(qTime - txTime) < Math.abs(new Date(closest.createdAt).getTime() - txTime)) {
        return q;
      }
      return closest;
    }, null);

    const doctorName = record?.doctor?.name || matchedQueue?.doctor?.name;
    const therapistName = matchedQueue?.therapist?.name;
    
    const handlers = [];
    if (doctorName) handlers.push(`Dr. ${doctorName.replace('Dr. ', '')}`);
    if (therapistName) handlers.push(therapistName);
    const handledBy = handlers.length > 0 ? handlers.join(' & ') : null;

    return {
      id: tx.id, // We use transaction ID as the key now
      patientId,
      visitDate: tx.createdAt,
      doctor: record?.doctor || null,
      handledBy,
      anamnesis: record?.anamnesis || '',
      diagnosis: record?.diagnosis || '',
      treatment: record?.treatment || '',
      transactionDesc,
      hasRecord: !!record
    }
  })

  return JSON.parse(JSON.stringify(mappedRecords))
}

export async function saveMedicalRecord(data: {
  transactionId: string;
  patientId: string;
  anamnesis: string;
  diagnosis: string;
  treatment: string;
}) {
  const existing = await prisma.medicalRecord.findFirst({
    where: { transactionId: data.transactionId }
  });

  if (existing) {
    const record = await prisma.medicalRecord.update({
      where: { id: existing.id },
      data: {
        anamnesis: data.anamnesis,
        diagnosis: data.diagnosis,
        treatment: data.treatment
      }
    });
    
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'MedicalRecord',
        entityId: record.id,
        newValue: JSON.stringify({ updatedFields: ['anamnesis', 'diagnosis', 'treatment'] }),
      },
    })
    
    return record;
  } else {
    // Try to find the latest queue to link the doctor
    const latestQueue = await prisma.queue.findFirst({
      where: { patientId: data.patientId },
      orderBy: { createdAt: 'desc' },
    });

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: data.patientId,
        transactionId: data.transactionId,
        doctorId: latestQueue?.doctorId || null,
        visitDate: new Date(),
        anamnesis: data.anamnesis,
        diagnosis: data.diagnosis,
        treatment: data.treatment
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'MedicalRecord',
        entityId: record.id,
        newValue: JSON.stringify({ message: 'Auto-created during save' }),
      },
    })
    
    return record;
  }
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
