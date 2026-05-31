import { PrismaClient } from '../src/generated/prisma/client'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function main() {
  console.log('🌱 Starting database seed...')


  // 1. DELETE EXISTING DATA

  console.log('⚠️ Clearing database...')
  await prisma.auditLog.deleteMany()
  await prisma.transactionItem.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.queue.deleteMany()
  await prisma.stockMovement.deleteMany()
  await prisma.medicalRecord.deleteMany()
  await prisma.serviceProduct.deleteMany()
  await prisma.promotion.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.product.deleteMany()
  await prisma.service.deleteMany()
  await prisma.operatingHours.deleteMany()
  await prisma.clinic.deleteMany()
  await prisma.user.deleteMany()
  await prisma.employee.deleteMany()

  // 2. EMPLOYEES
  console.log('👥 Seeding Employees...')
  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { id: 'emp-owner' },
      update: {},
      create: {
        id: 'emp-owner',
        name: 'dr. Popi Novia',
        role: 'DOCTOR',
        specialty: 'Beauty Doctor',
        status: 'ACTIVE',
        joinDate: new Date('2023-01-01'),
      },
    }),
    prisma.employee.upsert({
      where: { id: 'emp-kasir' },
      update: {},
      create: {
        id: 'emp-kasir',
        name: 'Riana Wulan',
        role: 'RECEPTIONIST',
        status: 'ACTIVE',
        joinDate: new Date('2023-06-01'),
      },
    }),
    prisma.employee.upsert({
      where: { id: 'emp-apoteker' },
      update: {},
      create: {
        id: 'emp-apoteker',
        name: 'Anisa Wulandari',
        role: 'PHARMACIST',
        specialty: 'Compounding',
        status: 'ACTIVE',
        joinDate: new Date('2022-08-01'),
      },
    }),
  ])

  // 3. USERS (login accounts)

  console.log('🔑 Seeding Users...')
  await Promise.all([
    prisma.user.upsert({
      where: { email: 'owner@sunrise.com' },
      update: {},
      create: {
        email: 'owner@sunrise.com',
        passwordHash: await hashPassword('aura123'),
        role: 'OWNER',
        isActive: true,
        employeeId: 'emp-owner'
      },
    }),
    prisma.user.upsert({
      where: { email: 'kasir@sunrise.com' },
      update: {},
      create: {
        email: 'kasir@sunrise.com',
        passwordHash: await hashPassword('aura123'),
        role: 'KASIR',
        isActive: true,
        employeeId: 'emp-kasir',
      },
    }),
    prisma.user.upsert({
      where: { email: 'apoteker@sunrise.com' },
      update: {},
      create: {
        email: 'apoteker@sunrise.com',
        passwordHash: await hashPassword('aura123'),
        role: 'APOTEKER',
        isActive: true,
        employeeId: 'emp-apoteker',
      },
    }),
  ])

  console.log('✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
