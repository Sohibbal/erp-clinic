// ============================================================
// MOCK DATA — Aura Beauty ERP
// Central data store used across all pages (frontend-only)
// ============================================================

// --- Auth ---
export const DUMMY_CREDENTIALS = [
  { email: 'kasir@aura.com', password: 'aura123', role: 'kasir' as const },
  { email: 'apoteker@aura.com', password: 'aura123', role: 'apoteker' as const },
  { email: 'owner@aura.com', password: 'aura123', role: 'owner' as const },
];

export type Role = 'kasir' | 'apoteker' | 'owner';

// --- Patients ---
export interface MedicalRecord {
  date: string;
  doctor: string;
  treatment: string;
  notes: string;
}

export interface Patient {
  name: string;
  initials: string;
  age: number;
  gender: 'Male' | 'Female';
  phone: string;
  dob: string;
  allergies: string;
  registeredDate: string;
  status: 'Returning' | 'New Patient';
  lastVisitDate: string;
  lastVisitTreatment: string;
  medicalHistory: MedicalRecord[];
  medicalHistory: MedicalRecord[];
  noRM: string;
  nik?: string;
  namaWali?: string;
  pekerjaan?: string;
}

export const PATIENTS: Patient[] = [
  {
    name: 'Sophia Montgomery', initials: 'SM', age: 24, gender: 'Female',
    phone: '+62 812-3456-7890', dob: '15 May 1999', allergies: 'Salicylic Acid',
    registeredDate: 'Jan 2023', status: 'Returning', lastVisitDate: 'Oct 12, 2023',
    lastVisitTreatment: 'Facial Acne Treatment',
    noRM: 'RM-0001', nik: '3271041505990001',
    medicalHistory: [
      { date: 'Oct 12, 2023', doctor: 'Dr. Elena', treatment: 'Facial Acne Treatment', notes: 'Patient showed improvement. Continued use of Night Cream recommended.' },
      { date: 'Sep 01, 2023', doctor: 'Dr. Elena', treatment: 'Initial Consultation', notes: 'Diagnosed with mild acne. Prescribed basic skincare set.' },
    ],
  },
  {
    name: 'Robert Jenkins', initials: 'RJ', age: 31, gender: 'Male',
    phone: '+62 811-2233-4455', dob: '08 Mar 1992', allergies: 'None',
    registeredDate: 'Mar 2023', status: 'Returning', lastVisitDate: 'Sep 05, 2023',
    lastVisitTreatment: 'Chemical Peel',
    noRM: 'RM-0002', nik: '3271040803920002',
    medicalHistory: [
      { date: 'Sep 05, 2023', doctor: 'Dr. James', treatment: 'Chemical Peel', notes: 'Standard glycolic peel applied. No adverse reactions.' },
    ],
  },
  {
    name: 'Elena Lockwood', initials: 'EL', age: 29, gender: 'Female',
    phone: '+62 855-6677-8899', dob: '22 Nov 1994', allergies: 'Retinol',
    registeredDate: 'Nov 2023', status: 'New Patient', lastVisitDate: 'New',
    lastVisitTreatment: '-',
    noRM: 'RM-0003', nik: '3271042211940003',
    medicalHistory: [],
  },
  {
    name: 'Aria Sterling', initials: 'AS', age: 27, gender: 'Female',
    phone: '+62 878-1122-3344', dob: '14 Jul 1996', allergies: 'None',
    registeredDate: 'Feb 2023', status: 'Returning', lastVisitDate: 'Oct 10, 2023',
    lastVisitTreatment: 'Botox Consultation',
    noRM: 'RM-0004', nik: '3271041407960004',
    medicalHistory: [
      { date: 'Oct 10, 2023', doctor: 'Dr. Elena', treatment: 'Botox Consultation', notes: 'Discussed forehead and glabella injection. Scheduled for next week.' },
    ],
  },
  {
    name: 'Julian Rivers', initials: 'JR', age: 31, gender: 'Male',
    phone: '+62 812-9988-7766', dob: '03 Jan 1992', allergies: 'Lidocaine',
    registeredDate: 'Jun 2023', status: 'Returning', lastVisitDate: 'Sep 28, 2023',
    lastVisitTreatment: 'Laser Hair Removal',
    noRM: 'RM-0005', nik: '3271040301920005',
    medicalHistory: [
      { date: 'Sep 28, 2023', doctor: 'Dr. James', treatment: 'Laser Hair Removal', notes: 'Session 3 of 6 completed. Skin response is normal.' },
    ],
  },
];

// --- Queue ---
export type QueueStatus = 'done' | 'in-room' | 'waiting';

export interface QueueItem {
  patientNoRM: string;
  patientName: string;
  initials: string;
  service: string;
  status: QueueStatus;
  estimatedTime: string;
}

export const INITIAL_QUEUE: QueueItem[] = [
  { patientNoRM: 'RM-0001', patientName: 'Sophia Montgomery', initials: 'SM', service: 'Facial Acne Treatment', status: 'done', estimatedTime: '' },
  { patientNoRM: 'RM-0002', patientName: 'Robert Jenkins', initials: 'RJ', service: 'Chemical Peel', status: 'in-room', estimatedTime: 'Est. 15 min' },
  { patientNoRM: 'RM-0003', patientName: 'Elena Lockwood', initials: 'EL', service: 'Botox Consultation', status: 'waiting', estimatedTime: '32 min wait' },
];

// --- Products / Inventory ---
export type StockStatus = 'In Stock' | 'Low Stock' | 'Expiring' | 'Out of Stock';

export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: StockStatus;
  icon: string;
  batchNo: string;
  lastRestock: string;
  expiryDate: string;
}

export const PRODUCTS: Product[] = [
  { id: 'P001', name: 'Hyaluronic Filler (Soft)', category: 'Injectables', stock: 2, price: 1500000, status: 'Low Stock', icon: 'vaccines', batchNo: 'HY-2024-001', lastRestock: 'Oct 12, 2023', expiryDate: 'Mar 2025' },
  { id: 'P002', name: 'Purifying Facial Toner', category: 'Skincare', stock: 45, price: 350000, status: 'In Stock', icon: 'water_drop', batchNo: 'SK-2024-082', lastRestock: 'Nov 05, 2023', expiryDate: 'Dec 2025' },
  { id: 'P003', name: 'Salicylic Acid 2% Serum', category: 'Treatments', stock: 18, price: 420000, status: 'In Stock', icon: 'science', batchNo: 'SK-2024-115', lastRestock: 'Oct 28, 2023', expiryDate: 'Jun 2025' },
  { id: 'P004', name: 'Botox Type A (50 Units)', category: 'Injectables', stock: 5, price: 3200000, status: 'Expiring', icon: 'medication', batchNo: 'BX-2024-004', lastRestock: 'Nov 10, 2023', expiryDate: 'Jan 2024' },
  { id: 'P005', name: 'Numbing Cream 10%', category: 'Clinical', stock: 0, price: 250000, status: 'Out of Stock', icon: 'sanitizer', batchNo: 'NC-2024-012', lastRestock: 'Sep 20, 2023', expiryDate: 'Aug 2025' },
  { id: 'P006', name: 'Cream Acne Night', category: 'Skincare', stock: 32, price: 180000, status: 'In Stock', icon: 'nightlight', batchNo: 'SK-2024-201', lastRestock: 'Nov 01, 2023', expiryDate: 'Sep 2025' },
  { id: 'P007', name: 'Toner Acne pH 5.5', category: 'Skincare', stock: 28, price: 150000, status: 'In Stock', icon: 'water_drop', batchNo: 'SK-2024-202', lastRestock: 'Oct 25, 2023', expiryDate: 'Jul 2025' },
  { id: 'P008', name: 'Serum Acne Blemish', category: 'Treatments', stock: 15, price: 280000, status: 'In Stock', icon: 'science', batchNo: 'SK-2024-203', lastRestock: 'Nov 08, 2023', expiryDate: 'May 2025' },
];

// --- Services ---
export interface ServiceProduct {
  productId: string;
  name: string;
  description: string;
  defaultQty: number;
  checked: boolean;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  promo?: {
    active: boolean;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
  };
  linkedProducts: ServiceProduct[];
}

export const SERVICES: Service[] = [
  {
    id: 'S001', name: 'Facial Acne Treatment', price: 120000,
    promo: { active: true, discountType: 'percentage', discountValue: 15 },
    linkedProducts: [
      { productId: 'P006', name: 'Cream Acne Night', description: '15gr • Daily Use', defaultQty: 1, checked: true },
      { productId: 'P007', name: 'Toner Acne pH 5.5', description: '100ml • Purifying', defaultQty: 1, checked: true },
      { productId: 'P008', name: 'Serum Acne Blemish', description: '20ml • Treatment', defaultQty: 1, checked: false },
      { productId: 'P002', name: 'Mask Acne Clay', description: '50gr • Home Kit', defaultQty: 1, checked: false },
    ],
  },
  {
    id: 'S002', name: 'Chemical Peel', price: 350000,
    promo: { active: false, discountType: 'fixed', discountValue: 50000 },
    linkedProducts: [
      { productId: 'P003', name: 'Salicylic Acid 2% Serum', description: '20ml • Prep', defaultQty: 1, checked: true },
      { productId: 'P002', name: 'Purifying Facial Toner', description: '100ml • Aftercare', defaultQty: 1, checked: true },
    ],
  },
  {
    id: 'S003', name: 'Botox Consultation', price: 500000,
    linkedProducts: [
      { productId: 'P004', name: 'Botox Type A (50 Units)', description: '50u • Injectable', defaultQty: 1, checked: true },
      { productId: 'P005', name: 'Numbing Cream 10%', description: '10gr • Topical', defaultQty: 1, checked: false },
    ],
  },
];

// --- Transactions ---
export type PaymentMethod = 'QRIS' | 'Transfer' | 'Cash';
export type TransactionStatus = 'Paid' | 'Pending';

export interface Transaction {
  id: string;
  invoiceId: string;
  patientName: string;
  service: string;
  products?: { name: string; qty: number; price: number }[];
  amount: number;
  method: PaymentMethod | null;
  methodIcon: string;
  status: TransactionStatus;
  time: string;
  date: string;
}

export const TRANSACTIONS: Transaction[] = [
  { id: 'T001', invoiceId: '#INV-20240412-024', patientName: 'Sophia Montgomery', service: 'Facial Acne Treatment', amount: 242000, method: 'QRIS', methodIcon: 'qr_code_2', status: 'Paid', time: '14:30 PM', date: 'today' },
  { id: 'T002', invoiceId: '#INV-20240412-023', patientName: 'Robert Jenkins', service: 'Chemical Peel', amount: 1550000, method: 'Transfer', methodIcon: 'account_balance', status: 'Paid', time: '13:15 PM', date: 'today' },
  { id: 'T003', invoiceId: '#INV-20240412-025', patientName: 'Elena Lockwood', service: 'Botox Consultation', amount: 450000, method: null, methodIcon: '', status: 'Pending', time: '15:00 PM', date: 'today' },
  { id: 'T004', invoiceId: '#INV-20240411-021', patientName: 'Aria Sterling', service: 'Laser Hair Removal', amount: 1200000, method: 'Transfer', methodIcon: 'account_balance', status: 'Paid', time: '10:00 AM', date: 'yesterday' },
  { id: 'T005', invoiceId: '#INV-20240411-020', patientName: 'Julian Rivers', service: 'Facial Acne Treatment', amount: 340000, method: 'Cash', methodIcon: 'payments', status: 'Paid', time: '09:30 AM', date: 'yesterday' },
];

// --- Product Requests (Apoteker) ---
export type RequestPriority = 'Urgent' | 'Routine';

export interface ProductRequestItem {
  name: string;
  qty: number;
  inStock: boolean;
}

export interface ProductRequest {
  id: string;
  patientName: string;
  room: string;
  treatment: string;
  priority: RequestPriority;
  items: ProductRequestItem[];
}

export const PRODUCT_REQUESTS: ProductRequest[] = [
  {
    id: 'REQ001', patientName: 'Elena Rodriguez', room: 'Room #402', treatment: 'Facial Acne Treatment',
    priority: 'Urgent',
    items: [
      { name: 'Cream Acne Forte', qty: 2, inStock: true },
      { name: 'Purifying Toner', qty: 1, inStock: true },
    ],
  },
  {
    id: 'REQ002', patientName: 'Julian Vane', room: 'Room #205', treatment: 'Botox Prep',
    priority: 'Routine',
    items: [
      { name: 'Numbing Gel 4%', qty: 1, inStock: true },
      { name: 'Sterile Swabs', qty: 5, inStock: true },
    ],
  },
  {
    id: 'REQ003', patientName: 'Aria Sterling', room: 'Room #301', treatment: 'Chemical Peel',
    priority: 'Routine',
    items: [
      { name: 'Glycolic Acid 30%', qty: 1, inStock: true },
      { name: 'Neutralizer Solution', qty: 1, inStock: true },
    ],
  },
];

// --- Checkout Items ---
export interface CheckoutItem {
  name: string;
  type: string;
  qty: number;
  price: number;
}

export const CHECKOUT_ITEMS: Record<string, CheckoutItem[]> = {
  'RM-0001': [
    { name: 'Facial Acne Deep Cleanse', type: 'Clinical Service', qty: 1, price: 120000 },
    { name: 'Aura Hydrating Cream', type: 'Product (50ml)', qty: 2, price: 45000 },
    { name: 'Skin Refresh Toner', type: 'Product (100ml)', qty: 1, price: 32000 },
  ],
  'RM-0002': [
    { name: 'Chemical Peel Session', type: 'Clinical Service', qty: 1, price: 350000 },
    { name: 'Post-Peel Soothing Cream', type: 'Product (30ml)', qty: 1, price: 85000 },
  ],
  'RM-0003': [
    { name: 'Botox Consultation', type: 'Clinical Service', qty: 1, price: 500000 },
  ],
};

// --- Doctors ---
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  patientsSeen: number;
  rating: number;
  imageUrl: string;
}

export const DOCTORS: Doctor[] = [
  { id: 'D001', name: 'Dr. Sarah Mitchell', specialty: 'Dermatology', patientsSeen: 142, rating: 4.9, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjRhSjgl16lYVFyXtNrQGtS8XHvXA6TdwvzSW2R4nz62F_zhvlLymAVvYyG79EmBxfT3T8ANxYup1kyoi4N_nUUF-NudrcrBGxnq-ikDM9KTAHSxJxzcwS137rsuYbtHS9DW0kVe6FJsB3OnCL6UgvK33LnGMu3gNaCUUePR42WxpFOgs6w-GJirXma_SqenIAh2z-4J-ArLtVLIrNQ81Jok8xAL1lLL6KFEzTipaoT83ElDieBc3Uw-VJGpIM-Wz_NfhzFRoIKAdO' },
  { id: 'D002', name: 'Dr. James Wilson', specialty: 'Aesthetic Surgery', patientsSeen: 128, rating: 4.8, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANiH3EwL2LewSsT6pBbF-Q8BGe9B9kt00IgIBPDthiNxu0SiLRdJqeFfCctHHW6dJSuiARdHx9XZOCh-AtMbcyl1F21P0TFxe2_J27LD9x7T7U3q47DvR_rBc92lcRCYlys48EPG5_2kH8Qo8-ZTMSBC4cmWXQLTymDIgQby-4AtA1pC-AMOJ8iRHHs7odNma2dpek0lWF2qyVsZKR1qGzmM2sE8tFaEuEgsOqh-oI6DabumPsg4qYK8u7b0iRnc_m0yYcMJArKsAr' },
  { id: 'D003', name: 'Dr. Elena Rodriguez', specialty: 'Aesthetic Medicine', patientsSeen: 115, rating: 5.0, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOBlZab2bj_dJ7O5wjLgTYyZW6IvnRa-q8F0WP5JLQPgURdC0SNbwntYA1bbNGio5e2czAarOc18StLLEsHLYexUjbPMfv_YLCau8moFFS8Xarr-3mQAsEJdpmKAqY8HEwETCzjCtCdcd3obklGzrZaj7-faRsyY3J2mj3lBIbwcyvDcby8o9cgj-n6wfjmWQkbMFgQ4NvjIyhBbZ4ScI2rgJf3Ok2zmQgR_KdkO87gLWHB_GS6j-ueiZYGWIGJd5w-1fimkWeJpZ8' },
];

// --- Owner Stats ---
export const OWNER_STATS = {
  totalRevenue: 124500,
  revenueChange: '+12.5%',
  totalPatients: 1284,
  topService: { name: 'Facial Acne', sessions: 320 },
  inventoryHealth: 'Good' as const,
  topServicesByRevenue: [
    { name: 'Facial Acne Treatment', revenue: 42500, percentage: 85 },
    { name: 'Laser Hair Removal', revenue: 31200, percentage: 62 },
    { name: 'Chemical Peeling', revenue: 18400, percentage: 38 },
  ],
  recentTransactions: [
    { name: 'Alice Whitaker', initials: 'AW', service: 'Full Laser Series', amount: 2400, status: 'Paid' as const, color: 'primary' },
    { name: 'Benjamin Moore', initials: 'BM', service: 'Dermal Fillers', amount: 1850, status: 'Paid' as const, color: 'secondary' },
    { name: 'Catherine Low', initials: 'CL', service: 'Vampire Facial', amount: 1200, status: 'Paid' as const, color: 'tertiary' },
  ],
};

// --- Helpers ---
export function formatCurrency(amount: number, currency: 'IDR' | 'USD' = 'IDR'): string {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }
  return `IDR ${amount.toLocaleString('id-ID')}`;
}
