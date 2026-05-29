import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { hashPassword } from './seed-utils'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ============================================================
  // 1. CLINIC & OPERATING HOURS
  // ============================================================
  const clinic = await prisma.clinic.upsert({
    where: { id: 'clinic-sunrise-001' },
    update: {},
    create: {
      id: 'clinic-sunrise-001',
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
  })
  console.log(`  ✅ Clinic: ${clinic.name}`)

  // ============================================================
  // 2. EMPLOYEES
  // ============================================================
  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { id: 'emp-d001' },
      update: {},
      create: {
        id: 'emp-d001',
        name: 'Dr. Sarah Mitchell',
        role: 'DOCTOR',
        specialty: 'Dermatology',
        status: 'ACTIVE',
        joinDate: new Date('2022-01-15'),
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjRhSjgl16lYVFyXtNrQGtS8XHvXA6TdwvzSW2R4nz62F_zhvlLymAVvYyG79EmBxfT3T8ANxYup1kyoi4N_nUUF-NudrcrBGxnq-ikDM9KTAHSxJxzcwS137rsuYbtHS9DW0kVe6FJsB3OnCL6UgvK33LnGMu3gNaCUUePR42WxpFOgs6w-GJirXma_SqenIAh2z-4J-ArLtVLIrNQ81Jok8xAL1lLL6KFEzTipaoT83ElDieBc3Uw-VJGpIM-Wz_NfhzFRoIKAdO',
      },
    }),
    prisma.employee.upsert({
      where: { id: 'emp-d002' },
      update: {},
      create: {
        id: 'emp-d002',
        name: 'Dr. James Wilson',
        role: 'DOCTOR',
        specialty: 'Aesthetic Surgery',
        status: 'ACTIVE',
        joinDate: new Date('2022-01-15'),
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANiH3EwL2LewSsT6pBbF-Q8BGe9B9kt00IgIBPDthiNxu0SiLRdJqeFfCctHHW6dJSuiARdHx9XZOCh-AtMbcyl1F21P0TFxe2_J27LD9x7T7U3q47DvR_rBc92lcRCYlys48EPG5_2kH8Qo8-ZTMSBC4cmWXQLTymDIgQby-4AtA1pC-AMOJ8iRHHs7odNma2dpek0lWF2qyVsZKR1qGzmM2sE8tFaEuEgsOqh-oI6DabumPsg4qYK8u7b0iRnc_m0yYcMJArKsAr',
      },
    }),
    prisma.employee.upsert({
      where: { id: 'emp-d003' },
      update: {},
      create: {
        id: 'emp-d003',
        name: 'Dr. Elena Rodriguez',
        role: 'DOCTOR',
        specialty: 'Aesthetic Medicine',
        status: 'ACTIVE',
        joinDate: new Date('2022-01-15'),
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOBlZab2bj_dJ7O5wjLgTYyZW6IvnRa-q8F0WP5JLQPgURdC0SNbwntYA1bbNGio5e2czAarOc18StLLEsHLYexUjbPMfv_YLCau8moFFS8Xarr-3mQAsEJdpmKAqY8HEwETCzjCtCdcd3obklGzrZaj7-faRsyY3J2mj3lBIbwcyvDcby8o9cgj-n6wfjmWQkbMFgQ4NvjIyhBbZ4ScI2rgJf3Ok2zmQgR_KdkO87gLWHB_GS6j-ueiZYGWIGJd5w-1fimkWeJpZ8',
      },
    }),
    prisma.employee.upsert({
      where: { id: 'emp-s001' },
      update: {},
      create: {
        id: 'emp-s001',
        name: 'Anna Kusuma',
        role: 'PHARMACIST',
        specialty: 'Clinical Pharmacy',
        status: 'ACTIVE',
        joinDate: new Date('2022-03-01'),
      },
    }),
    prisma.employee.upsert({
      where: { id: 'emp-s002' },
      update: {},
      create: {
        id: 'emp-s002',
        name: 'Rizky Pratama',
        role: 'RECEPTIONIST',
        specialty: 'Front Desk',
        status: 'ACTIVE',
        joinDate: new Date('2023-06-01'),
      },
    }),
    prisma.employee.upsert({
      where: { id: 'emp-s003' },
      update: {},
      create: {
        id: 'emp-s003',
        name: 'Dewi Sartika',
        role: 'PHARMACIST',
        specialty: 'Compounding',
        status: 'ON_LEAVE',
        joinDate: new Date('2022-08-01'),
      },
    }),
  ])
  console.log(`  ✅ Employees: ${employees.length} records`)

  // ============================================================
  // 3. USERS (login accounts)
  // ============================================================
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'owner@aura.com' },
      update: {},
      create: {
        email: 'owner@aura.com',
        passwordHash: await hashPassword('aura123'),
        role: 'OWNER',
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'kasir@aura.com' },
      update: {},
      create: {
        email: 'kasir@aura.com',
        passwordHash: await hashPassword('aura123'),
        role: 'KASIR',
        isActive: true,
        employeeId: 'emp-s002',
      },
    }),
    prisma.user.upsert({
      where: { email: 'apoteker@aura.com' },
      update: {},
      create: {
        email: 'apoteker@aura.com',
        passwordHash: await hashPassword('aura123'),
        role: 'APOTEKER',
        isActive: true,
        employeeId: 'emp-s001',
      },
    }),
  ])
  console.log(`  ✅ Users: ${users.length} accounts`)

  // ============================================================
  // 4. PATIENTS
  // ============================================================
  const patients = await Promise.all([
    prisma.patient.upsert({
      where: { noRM: 'RM-0001' },
      update: {},
      create: {
        noRM: 'RM-0001',
        nik: '3271041505990001',
        name: 'Sophia Montgomery',
        gender: 'FEMALE',
        phone: '+62 812-3456-7890',
        dateOfBirth: new Date('1999-05-15'),
        allergies: 'Salicylic Acid',
        status: 'RETURNING',
      },
    }),
    prisma.patient.upsert({
      where: { noRM: 'RM-0002' },
      update: {},
      create: {
        noRM: 'RM-0002',
        nik: '3271040803920002',
        name: 'Robert Jenkins',
        gender: 'MALE',
        phone: '+62 811-2233-4455',
        dateOfBirth: new Date('1992-03-08'),
        allergies: null,
        status: 'RETURNING',
      },
    }),
    prisma.patient.upsert({
      where: { noRM: 'RM-0003' },
      update: {},
      create: {
        noRM: 'RM-0003',
        nik: '3271042211940003',
        name: 'Elena Lockwood',
        gender: 'FEMALE',
        phone: '+62 855-6677-8899',
        dateOfBirth: new Date('1994-11-22'),
        allergies: 'Retinol',
        status: 'NEW_PATIENT',
      },
    }),
    prisma.patient.upsert({
      where: { noRM: 'RM-0004' },
      update: {},
      create: {
        noRM: 'RM-0004',
        nik: '3271041407960004',
        name: 'Aria Sterling',
        gender: 'FEMALE',
        phone: '+62 878-1122-3344',
        dateOfBirth: new Date('1996-07-14'),
        status: 'RETURNING',
      },
    }),
    prisma.patient.upsert({
      where: { noRM: 'RM-0005' },
      update: {},
      create: {
        noRM: 'RM-0005',
        nik: '3271040301920005',
        name: 'Julian Rivers',
        gender: 'MALE',
        phone: '+62 812-9988-7766',
        dateOfBirth: new Date('1992-01-03'),
        allergies: 'Lidocaine',
        status: 'RETURNING',
      },
    }),
  ])
  console.log(`  ✅ Patients: ${patients.length} records`)

  // ============================================================
  // 5. PRODUCTS (Inventory)
  // ============================================================
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 'prod-001' },
      update: {},
      create: {
        id: 'prod-001',
        name: 'Hyaluronic Filler (Soft)',
        category: 'Injectables',
        stock: 2,
        price: 1500000,
        stockStatus: 'LOW_STOCK',
        icon: 'vaccines',
        batchNo: 'HY-2024-001',
        lastRestock: new Date('2023-10-12'),
        expiryDate: new Date('2025-03-01'),
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-002' },
      update: {},
      create: {
        id: 'prod-002',
        name: 'Purifying Facial Toner',
        category: 'Skincare',
        stock: 45,
        price: 350000,
        stockStatus: 'IN_STOCK',
        icon: 'water_drop',
        batchNo: 'SK-2024-082',
        lastRestock: new Date('2023-11-05'),
        expiryDate: new Date('2025-12-01'),
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-003' },
      update: {},
      create: {
        id: 'prod-003',
        name: 'Salicylic Acid 2% Serum',
        category: 'Treatments',
        stock: 18,
        price: 420000,
        stockStatus: 'IN_STOCK',
        icon: 'science',
        batchNo: 'SK-2024-115',
        lastRestock: new Date('2023-10-28'),
        expiryDate: new Date('2025-06-01'),
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-004' },
      update: {},
      create: {
        id: 'prod-004',
        name: 'Botox Type A (50 Units)',
        category: 'Injectables',
        stock: 5,
        price: 3200000,
        stockStatus: 'EXPIRING',
        icon: 'medication',
        batchNo: 'BX-2024-004',
        lastRestock: new Date('2023-11-10'),
        expiryDate: new Date('2024-01-01'),
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-005' },
      update: {},
      create: {
        id: 'prod-005',
        name: 'Numbing Cream 10%',
        category: 'Clinical',
        stock: 0,
        price: 250000,
        stockStatus: 'OUT_OF_STOCK',
        icon: 'sanitizer',
        batchNo: 'NC-2024-012',
        lastRestock: new Date('2023-09-20'),
        expiryDate: new Date('2025-08-01'),
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-006' },
      update: {},
      create: {
        id: 'prod-006',
        name: 'Cream Acne Night',
        category: 'Skincare',
        stock: 32,
        price: 180000,
        stockStatus: 'IN_STOCK',
        icon: 'nightlight',
        batchNo: 'SK-2024-201',
        lastRestock: new Date('2023-11-01'),
        expiryDate: new Date('2025-09-01'),
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-007' },
      update: {},
      create: {
        id: 'prod-007',
        name: 'Toner Acne pH 5.5',
        category: 'Skincare',
        stock: 28,
        price: 150000,
        stockStatus: 'IN_STOCK',
        icon: 'water_drop',
        batchNo: 'SK-2024-202',
        lastRestock: new Date('2023-10-25'),
        expiryDate: new Date('2025-07-01'),
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-008' },
      update: {},
      create: {
        id: 'prod-008',
        name: 'Serum Acne Blemish',
        category: 'Treatments',
        stock: 15,
        price: 280000,
        stockStatus: 'IN_STOCK',
        icon: 'science',
        batchNo: 'SK-2024-203',
        lastRestock: new Date('2023-11-08'),
        expiryDate: new Date('2025-05-01'),
      },
    }),
  ])
  console.log(`  ✅ Products: ${products.length} records`)

  // ============================================================
  // 6. SERVICES & LINKED PRODUCTS
  // ============================================================
  const service1 = await prisma.service.upsert({
    where: { id: 'svc-001' },
    update: {},
    create: {
      id: 'svc-001',
      name: 'Facial Acne Treatment',
      basePrice: 120000,
      isActive: true,
      linkedProducts: {
        create: [
          { productId: 'prod-006', defaultQty: 1, description: '15gr • Daily Use', isDefaultChecked: true },
          { productId: 'prod-007', defaultQty: 1, description: '100ml • Purifying', isDefaultChecked: true },
          { productId: 'prod-008', defaultQty: 1, description: '20ml • Treatment', isDefaultChecked: false },
          { productId: 'prod-002', defaultQty: 1, description: '50gr • Home Kit', isDefaultChecked: false },
        ],
      },
      promotions: {
        create: {
          isActive: true,
          discountType: 'PERCENTAGE',
          discountValue: 15,
        },
      },
    },
  })

  const service2 = await prisma.service.upsert({
    where: { id: 'svc-002' },
    update: {},
    create: {
      id: 'svc-002',
      name: 'Chemical Peel',
      basePrice: 350000,
      isActive: true,
      linkedProducts: {
        create: [
          { productId: 'prod-003', defaultQty: 1, description: '20ml • Prep', isDefaultChecked: true },
          { productId: 'prod-002', defaultQty: 1, description: '100ml • Aftercare', isDefaultChecked: true },
        ],
      },
      promotions: {
        create: {
          isActive: false,
          discountType: 'FIXED',
          discountValue: 50000,
        },
      },
    },
  })

  const service3 = await prisma.service.upsert({
    where: { id: 'svc-003' },
    update: {},
    create: {
      id: 'svc-003',
      name: 'Botox Consultation',
      basePrice: 500000,
      isActive: true,
      linkedProducts: {
        create: [
          { productId: 'prod-004', defaultQty: 1, description: '50u • Injectable', isDefaultChecked: true },
          { productId: 'prod-005', defaultQty: 1, description: '10gr • Topical', isDefaultChecked: false },
        ],
      },
    },
  })
  console.log(`  ✅ Services: ${[service1, service2, service3].length} records with linked products`)

  // ============================================================
  // 7. MEDICAL RECORDS
  // ============================================================
  const medicalRecords = await Promise.all([
    prisma.medicalRecord.create({
      data: {
        patientId: patients[0].id, // Sophia Montgomery
        doctorId: 'emp-d003', // Dr. Elena
        visitDate: new Date('2023-10-12'),
        treatment: 'Facial Acne Treatment',
        notes: 'Patient showed improvement. Continued use of Night Cream recommended.',
      },
    }),
    prisma.medicalRecord.create({
      data: {
        patientId: patients[0].id,
        doctorId: 'emp-d003',
        visitDate: new Date('2023-09-01'),
        treatment: 'Initial Consultation',
        notes: 'Diagnosed with mild acne. Prescribed basic skincare set.',
      },
    }),
    prisma.medicalRecord.create({
      data: {
        patientId: patients[1].id, // Robert Jenkins
        doctorId: 'emp-d002', // Dr. James
        visitDate: new Date('2023-09-05'),
        treatment: 'Chemical Peel',
        notes: 'Standard glycolic peel applied. No adverse reactions.',
      },
    }),
    prisma.medicalRecord.create({
      data: {
        patientId: patients[3].id, // Aria Sterling
        doctorId: 'emp-d003',
        visitDate: new Date('2023-10-10'),
        treatment: 'Botox Consultation',
        notes: 'Discussed forehead and glabella injection. Scheduled for next week.',
      },
    }),
    prisma.medicalRecord.create({
      data: {
        patientId: patients[4].id, // Julian Rivers
        doctorId: 'emp-d002',
        visitDate: new Date('2023-09-28'),
        treatment: 'Laser Hair Removal',
        notes: 'Session 3 of 6 completed. Skin response is normal.',
      },
    }),
  ])
  console.log(`  ✅ Medical Records: ${medicalRecords.length} records`)

  // ============================================================
  // 8. TRANSACTIONS
  // ============================================================
  const tx1 = await prisma.transaction.upsert({
    where: { invoiceId: '#INV-20240412-024' },
    update: {},
    create: {
      invoiceId: '#INV-20240412-024',
      patientId: patients[0].id,
      cashierId: users[1].id, // kasir
      transactionType: 'CLINIC_SERVICE',
      subtotal: 242000,
      totalAmount: 242000,
      paymentMethod: 'QRIS',
      status: 'PAID',
      paidAt: new Date(),
      items: {
        create: [
          { itemType: 'SERVICE', serviceId: 'svc-001', itemName: 'Facial Acne Treatment', quantity: 1, unitPrice: 120000, subtotal: 120000 },
          { itemType: 'PRODUCT', productId: 'prod-006', itemName: 'Cream Acne Night', quantity: 1, unitPrice: 180000, subtotal: 180000 },
        ],
      },
    },
  })

  const tx2 = await prisma.transaction.upsert({
    where: { invoiceId: '#INV-20240412-023' },
    update: {},
    create: {
      invoiceId: '#INV-20240412-023',
      patientId: patients[1].id,
      cashierId: users[1].id,
      transactionType: 'CLINIC_SERVICE',
      subtotal: 1550000,
      totalAmount: 1550000,
      paymentMethod: 'TRANSFER',
      status: 'PAID',
      paidAt: new Date(),
      items: {
        create: [
          { itemType: 'SERVICE', serviceId: 'svc-002', itemName: 'Chemical Peel', quantity: 1, unitPrice: 350000, subtotal: 350000 },
        ],
      },
    },
  })

  const tx3 = await prisma.transaction.upsert({
    where: { invoiceId: '#INV-20240412-025' },
    update: {},
    create: {
      invoiceId: '#INV-20240412-025',
      patientId: patients[2].id,
      cashierId: users[1].id,
      transactionType: 'CLINIC_SERVICE',
      subtotal: 450000,
      totalAmount: 450000,
      status: 'PENDING',
      items: {
        create: [
          { itemType: 'SERVICE', serviceId: 'svc-003', itemName: 'Botox Consultation', quantity: 1, unitPrice: 500000, subtotal: 500000 },
        ],
      },
    },
  })

  const tx4 = await prisma.transaction.upsert({
    where: { invoiceId: '#INV-20240411-021' },
    update: {},
    create: {
      invoiceId: '#INV-20240411-021',
      patientId: patients[3].id,
      cashierId: users[1].id,
      transactionType: 'CLINIC_SERVICE',
      subtotal: 1200000,
      totalAmount: 1200000,
      paymentMethod: 'TRANSFER',
      status: 'PAID',
      paidAt: new Date(),
      items: {
        create: [
          { itemType: 'SERVICE', itemName: 'Laser Hair Removal', quantity: 1, unitPrice: 1200000, subtotal: 1200000 },
        ],
      },
    },
  })

  const tx5 = await prisma.transaction.upsert({
    where: { invoiceId: '#INV-20240411-020' },
    update: {},
    create: {
      invoiceId: '#INV-20240411-020',
      patientId: patients[4].id,
      cashierId: users[1].id,
      transactionType: 'CLINIC_SERVICE',
      subtotal: 340000,
      totalAmount: 340000,
      paymentMethod: 'CASH',
      status: 'PAID',
      paidAt: new Date(),
      items: {
        create: [
          { itemType: 'SERVICE', serviceId: 'svc-001', itemName: 'Facial Acne Treatment', quantity: 1, unitPrice: 120000, subtotal: 120000 },
        ],
      },
    },
  })
  console.log(`  ✅ Transactions: ${[tx1, tx2, tx3, tx4, tx5].length} records`)

  // ============================================================
  // 9. QUEUE (today's queue)
  // ============================================================
  const queues = await Promise.all([
    prisma.queue.create({
      data: {
        patientId: patients[0].id,
        doctorId: 'emp-d003',
        serviceName: 'Facial Acne Treatment',
        status: 'DONE',
        queueNumber: 1,
        queueDate: new Date(),
      },
    }),
    prisma.queue.create({
      data: {
        patientId: patients[1].id,
        doctorId: 'emp-d002',
        serviceName: 'Chemical Peel',
        status: 'IN_ROOM',
        queueNumber: 2,
        estimatedTime: 'Est. 15 min',
        queueDate: new Date(),
      },
    }),
    prisma.queue.create({
      data: {
        patientId: patients[2].id,
        doctorId: 'emp-d003',
        serviceName: 'Botox Consultation',
        status: 'WAITING',
        queueNumber: 3,
        estimatedTime: '32 min wait',
        queueDate: new Date(),
      },
    }),
  ])
  console.log(`  ✅ Queue: ${queues.length} entries`)

  console.log('\n🎉 Seeding completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
