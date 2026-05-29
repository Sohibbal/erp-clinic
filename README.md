# 🏥 Sunrise ERP Clinic

A modern, comprehensive Enterprise Resource Planning (ERP) web application designed specifically for clinic management. Built with Next.js 14, React 19, Tailwind CSS v4, and Prisma ORM, this platform streamlines clinic operations ranging from patient registration to inventory management and cashier billing.

---

## ✨ Features

- **🛡️ Role-Based Access Control (RBAC):** Tailored interfaces and permissions for Owner, Cashier (Kasir), and Pharmacist (Apoteker).
- **📊 Interactive Dashboards:** Real-time analytics, revenue tracking, and global reports for clinic owners.
- **💳 Cashier & Billing System:** Seamless POS system to handle clinic services, product purchases, and invoice generation.
- **📦 Inventory Management:** Track stock levels, low-stock alerts, restock history, and product expiry dates.
- **🧑‍⚕️ Employee & Patient Management:** Manage staff profiles, doctors, therapists, patient records, and queues.
- **📋 Medical Records:** Digital medical records (EMR) integrated directly with patient profiles.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL
- **Language:** TypeScript
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/) (Toast notifications)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18 or higher) or [Bun](https://bun.sh/)
- [PostgreSQL](https://www.postgresql.org/) (Local or Cloud, e.g., Supabase/Neon)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/erp-clinic.git
   cd erp-clinic
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or if you use bun
   bun install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your PostgreSQL database connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/erp_clinic?schema=public"
   ```

4. **Initialize Database:**
   Push the Prisma schema to your database to create the necessary tables:
   ```bash
   npm run db:push
   ```

5. **Seed the Database:**
   Populate the database with initial mock data and login credentials:
   ```bash
   npm run db:seed
   ```

6. **Start the Development Server:**
   ```bash
   npm run dev
   # or
   bun run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🔑 Default Credentials

After running the seed script, you can log in using the following default accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Owner** | `owner@aura.com` | `aura123` |
| **Kasir** | `kasir@aura.com` | `aura123` |
| **Apoteker** | `apoteker@aura.com` | `aura123` |

---

## 📜 Available Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the application for production.
- `npm run start` - Starts the production server.
- `npm run lint` - Runs ESLint for code formatting checks.
- `npm run db:push` - Pushes the current Prisma schema state to the database.
- `npm run db:seed` - Executes `prisma/seed.ts` to populate the database.
- `npm run db:studio` - Opens Prisma Studio at `localhost:5555` to view/edit database records via a GUI.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue for bugs, feature requests, or documentation improvements.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
