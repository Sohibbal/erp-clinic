'use server'

import prisma from '@/lib/prisma'
import type { EmployeeRole, EmployeeStatus } from '@/generated/prisma/client'

// ============================================================
// EMPLOYEE — Server Actions
// ============================================================

export async function getEmployees(roleFilter?: EmployeeRole) {
  return prisma.employee.findMany({
    where: roleFilter ? { role: roleFilter } : {},
    include: {
      user: { select: { email: true, role: true, isActive: true } },
      _count: {
        select: {
          doctorQueues: true,
          therapistQueues: true,
          medicalRecords: true,
        }
      }
    },
    orderBy: { name: 'asc' },
  })
}

export async function getEmployeeById(id: string) {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, role: true, isActive: true } },
      medicalRecords: { select: { id: true } },
      doctorQueues: { select: { id: true } },
    },
  })
}

export async function createEmployee(data: {
  name: string
  role: EmployeeRole
  specialty: string
  joinDate: string
  phone?: string
  imageUrl?: string
}) {
  const employee = await prisma.employee.create({
    data: {
      name: data.name,
      role: data.role,
      specialty: data.specialty,
      joinDate: new Date(data.joinDate),
      phone: data.phone || null,
      imageUrl: data.imageUrl || null,
    },
  })

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'Employee',
      entityId: employee.id,
      newValue: JSON.stringify(employee),
    },
  })

  return employee
}

export async function updateEmployee(
  id: string,
  data: {
    name?: string
    role?: EmployeeRole
    specialty?: string
    joinDate?: string
    phone?: string
    imageUrl?: string
  }
) {
  const oldEmployee = await prisma.employee.findUnique({ where: { id } })

  const employee = await prisma.employee.update({
    where: { id },
    data: {
      ...data,
      joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
    },
  })

  await prisma.auditLog.create({
    data: {
      action: 'UPDATE',
      entityType: 'Employee',
      entityId: id,
      oldValue: JSON.stringify(oldEmployee),
      newValue: JSON.stringify(employee),
    },
  })

  return employee
}

export async function toggleEmployeeStatus(id: string) {
  const employee = await prisma.employee.findUnique({ where: { id } })
  if (!employee) throw new Error('Employee not found')

  const newStatus: EmployeeStatus = employee.status === 'ACTIVE' ? 'ON_LEAVE' : 'ACTIVE'

  return prisma.employee.update({
    where: { id },
    data: { status: newStatus },
  })
}

export async function deleteEmployee(id: string) {
  const employee = await prisma.employee.findUnique({ where: { id } })

  await prisma.auditLog.create({
    data: {
      action: 'DELETE',
      entityType: 'Employee',
      entityId: id,
      oldValue: JSON.stringify(employee),
    },
  })

  return prisma.employee.delete({ where: { id } })
}

export async function getDoctors() {
  return prisma.employee.findMany({
    where: { role: 'DOCTOR', status: 'ACTIVE' },
    orderBy: { name: 'asc' },
  })
}

export async function getTherapists() {
  return prisma.employee.findMany({
    where: { role: 'THERAPIST', status: 'ACTIVE' },
    orderBy: { name: 'asc' },
  })
}

export async function getEmployeePerformance() {
  const employees = await prisma.employee.findMany({
    where: {
      role: { in: ['DOCTOR', 'THERAPIST'] }
    },
    include: {
      _count: {
        select: {
          medicalRecords: true,
          therapistQueues: true
        }
      }
    }
  });

  // Calculate total patients handled
  const performance = employees.map(emp => ({
    id: emp.id,
    name: emp.name,
    role: emp.role,
    imageUrl: emp.imageUrl,
    // Doctor handled patients = medicalRecords count. Therapist handled patients = therapistQueues count
    patientCount: emp.role === 'DOCTOR' ? emp._count.medicalRecords : emp._count.therapistQueues
  }));

  // Sort descending by patientCount
  return performance.sort((a, b) => b.patientCount - a.patientCount);
}
