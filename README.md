<div align="center">
  <img src="./public/logo.jpg" alt="Sunrise Clinic Logo" width="250" />
  
  <h1 align="center">ERP Sunrise Clinic</h1>

  <p align="center">
    Sistem Enterprise Resource Planning (ERP) modern, elegan, dan komprehensif yang dirancang khusus untuk manajemen klinik kecantikan & estetika.
    <br />
    <a href="#-fitur-utama"><strong>Jelajahi Fitur »</strong></a>
    <br />
    <br />
    <a href="#-tech-stack">Tech Stack</a>
    ·
    <a href="#-panduan-instalasi">Panduan Instalasi</a>
    ·
    <a href="#-alur-sistem">Alur Sistem</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js_14-FAEDCD?style=for-the-badge&logo=next.js&logoColor=black" alt="Next.js" />
    <img src="https://img.shields.io/badge/React_19-D4A373?style=for-the-badge&logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS_4-FEFAE0?style=for-the-badge&logo=tailwindcss&logoColor=black" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Prisma_ORM-D4A373?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-FAEDCD?style=for-the-badge&logo=postgresql&logoColor=black" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/TypeScript-D4A373?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </p>
</div>

---

## 📖 Tentang Projek

**ERP Sunrise Clinic** adalah aplikasi web modern yang dibangun untuk menyederhanakan, mengotomatisasi, dan menata seluruh operasional harian Klinik Kecantikan Sunrise. Mengusung desain antarmuka yang bersih, elegan, dan *responsive* (bernuansa *chocolate & cream*), sistem ini menyediakan pembaruan data secara *real-time* dan mencakup seluruh aspek bisnis klinik, mulai dari manajemen pasien, antrean, rekam medis, inventori, hingga laporan keuangan komprehensif.

Aplikasi ini dibangun menggunakan arsitektur modern berbasis **Next.js App Router** dipadukan dengan **Server Actions**, memastikan performa yang cepat, aman, dan *SEO-friendly* tanpa perlu membangun API terpisah.

---

## ✨ Fitur Utama

Sistem ini membagi fungsionalitasnya berdasarkan peran (*Role-Based Access Control*), memastikan setiap pengguna hanya mengakses fitur yang relevan dengan tugas mereka.

### 🛡️ Role-Based Access Control (RBAC)
- **Owner (Pemilik/Dokter Utama):** Akses penuh ke dasbor analitik, laporan pendapatan, manajemen staf, manajemen layanan, dan laporan audit.
- **Kasir (Resepsionis):** Akses penuh ke pendaftaran pasien, manajemen antrean, proses transaksi (POS), dan cetak struk/invoice.
- **Apoteker:** Akses khusus ke manajemen inventori, produk, penjualan retail, dan riwayat mutasi stok.

### 📊 Dasbor Analitik & Laporan Keuangan (Owner)
- Ringkasan statistik *real-time*: Pendapatan harian/bulanan, total pasien, dan total kunjungan.
- Grafik pendapatan interaktif menggunakan **Recharts**.
- Laporan transaksi mendetail yang dapat difilter berdasarkan bulan dan tahun.
- Pelacakan aktivitas pengguna (Audit Log) untuk keamanan dan transparansi.

### 💳 Point of Sale (POS) & Manajemen Transaksi
- Proses *checkout* 2 langkah yang intuitif.
- Kalkulasi otomatis untuk harga layanan, potongan promo/diskon, dan pembelian produk retail (skincare/obat).
- Cetak struk dan invoice berformat PDF/Print-ready yang rapi.
- Status pembayaran dinamis (`PENDING`, `PAID`, dll).

### 🧑‍⚕️ Manajemen Pasien & Antrean (*Real-time*)
- Registrasi pasien baru dengan data rekam medis dasar (alergi, riwayat).
- Sistem antrean yang langsung terhubung ke kasir dan dokter/terapis.
- Pelacakan riwayat kunjungan dan transaksi per pasien secara akurat.

### 📋 Rekam Medis Elektronik (EMR)
- Pencatatan anamnesis, diagnosis (contoh: *Acne vulgaris, Hiperpigmentasi*), dan *treatment* yang diberikan.
- Rekam medis terintegrasi langsung dengan tagihan/transaksi kunjungan pasien.

### 📦 Manajemen Inventori (Apoteker)
- Pelacakan stok produk *real-time* (Skincare, Obat Topikal, Bahan Peeling, dll).
- Kategorisasi produk otomatis: `IN_STOCK`, `LOW_STOCK`, `EXPIRING`, dan `OUT_OF_STOCK`.
- Log *Stock Movement* (Mutasi Stok): Melacak setiap penambahan (`RESTOCK`), penjualan (`SALE`), penggunaan (`USAGE`), atau koreksi (`ADJUSTMENT`).

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router & Server Actions)
- **Library UI:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Database ORM:** [Prisma ORM](https://www.prisma.io/)
- **Database System:** PostgreSQL
- **Bahasa Pemrograman:** [TypeScript](https://www.typescriptlang.org/)
- **Visualisasi Data:** [Recharts](https://recharts.org/)
- **Notifikasi/Toast:** [Sonner](https://sonner.emilkowal.ski/)

---

## 🚀 Panduan Instalasi

Ikuti langkah-langkah di bawah ini untuk menjalankan ERP Sunrise Clinic di perangkat lokal Anda.

### Prasyarat
Pastikan sistem Anda sudah menginstal:
- [Node.js](https://nodejs.org/) (v18+) atau [Bun](https://bun.sh/)
- PostgreSQL (Lokal atau Cloud seperti Supabase/Neon/Railway)
- Git

### Langkah Instalasi

1. **Clone Repositori**
   ```bash
   git clone https://github.com/your-username/erp-clinic.git
   cd erp-clinic
   ```

2. **Instal Dependensi**
   Anda bisa menggunakan NPM atau Bun (disarankan untuk kecepatan).
   ```bash
   npm install
   # atau
   bun install
   ```

3. **Konfigurasi Environment Variables**
   Buat file `.env` di *root directory* dan masukkan konfigurasi database PostgreSQL Anda.
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/erp_clinic?schema=public"
   ```

4. **Inisialisasi Database (Push Schema)**
   Sinkronkan schema Prisma ke database PostgreSQL Anda untuk membuat tabel.
   ```bash
   npx prisma db push
   # atau
   bunx prisma db push
   ```

5. **Generate Data Simulasi (Seed Database)**
   Sistem sudah dilengkapi dengan script *seed* komprehensif yang menghasilkan data simulasi 1 tahun operasional (Pasien, Transaksi, Rekam Medis, Stok, Karyawan).
   ```bash
   npm run db:seed
   # atau
   bun run prisma/seed.ts
   ```

6. **Jalankan Server Development**
   ```bash
   npm run dev
   # atau
   bun run dev
   ```
   Akses aplikasi di [http://localhost:3000](http://localhost:3000).

---

## 🔑 Akun Demo (Default Credentials)

Setelah menjalankan langkah **Seed Database**, Anda dapat mencoba login menggunakan akun demo berikut untuk melihat antarmuka masing-masing peran:

| Role | Nama | Email | Password |
| :--- | :--- | :--- | :--- |
| **Owner (Dokter)** | dr. Popi Novia | `owner@sunrise.com` | `aura123` |
| **Kasir** | Riana Wulan | `kasir@sunrise.com` | `aura123` |
| **Apoteker** | Anisa Wulandari | `apoteker@sunrise.com` | `aura123` |

> **Catatan:** Pastikan untuk mengganti kata sandi default jika aplikasi akan di-*deploy* ke *production*.

---

## 🏗️ Struktur Proyek & Alur Sistem

Proyek ini dibangun menggunakan fitur **App Router** dari Next.js. Berikut adalah penjelasan struktur direktori utama:

```text
erp-clinic/
├── prisma/
│   ├── schema.prisma       # Definisi tabel database dan relasi
│   └── seed.ts             # Script generate data simulasi 1 tahun operasional
├── public/                 # Aset publik (Logo, Font, Icon)
├── src/
│   ├── actions/            # Server Actions (Pengganti API routes, berisi logika backend)
│   ├── app/                # Halaman aplikasi berbasis App Router (/, /owner, /kasir, dll)
│   ├── components/         # Komponen UI Reusable (Button, Modal, Input)
│   ├── features/           # Komponen spesifik per fitur (InventoryView, POS, PatientForm)
│   └── lib/                # Konfigurasi utility (Prisma client instance, formater)
└── package.json            # Daftar dependencies & scripts
```

### Alur Kerja (Server Actions)
Alih-alih menggunakan traditional API routes (`/api/...`), proyek ini sepenuhnya mengadopsi **Next.js Server Actions**. Setiap kali pengguna mengirim form atau berinteraksi dengan UI, komponen Client-Side memanggil fungsi asinkron (misal: `createTransaction`) yang dieksekusi secara langsung di lingkungan Server. Ini menjamin keamanan database dan mempercepat waktu *development*.

---

## 📜 Daftar Command / Scripts

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan aplikasi dalam mode pengembangan (*development*). |
| `npm run build` | Mengompilasi aplikasi untuk lingkungan produksi (*production*). |
| `npm run start` | Menjalankan aplikasi hasil *build* di lingkungan produksi. |
| `npm run lint` | Menjalankan ESLint untuk memeriksa kualitas kode. |
| `npm run db:push` | Mengubah skema database sesuai dengan `prisma/schema.prisma`. |
| `npm run db:seed` | Menjalankan `prisma/seed.ts` untuk mengisi database dengan data awal/demo. |
| `npm run db:studio`| Membuka Prisma Studio di browser untuk melihat/mengedit data database. |

---

## 🤝 Kontribusi

Kami sangat terbuka untuk kontribusi! Jika Anda ingin menambahkan fitur, memperbaiki *bug*, atau meningkatkan performa aplikasi:

1. *Fork* repositori ini.
2. Buat *branch* fitur Anda (`git checkout -b feature/FiturBaru`).
3. *Commit* perubahan Anda (`git commit -m 'Menambahkan FiturBaru'`).
4. *Push* ke *branch* tersebut (`git push origin feature/FiturBaru`).
5. Buka *Pull Request* baru.

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Bebas digunakan, dimodifikasi, dan didistribusikan untuk keperluan pribadi maupun komersial.

<p align="center">
  <br>
  <i>Dirancang dengan 🤎 untuk pengalaman manajemen kesehatan dan estetika yang lebih baik.</i>
</p>
