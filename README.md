<div align="center">
  <img src="https://img.shields.io/badge/Sunrise-Clinic-D4A373?style=for-the-badge&logo=medapps&logoColor=white" alt="ERP Sunrise Clinic" />
  
  <h1 align="center">ERP Sunrise Clinic</h1>

  <p align="center">
    A comprehensive, elegantly designed Enterprise Resource Planning (ERP) web application specifically built for modern clinic management.
    <br />
    <a href="#-features"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="#-getting-started">View Demo</a>
    ·
    <a href="#-report-bug">Report Bug</a>
    ·
    <a href="#-request-feature">Request Feature</a>
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

## 🤎 About The Project

**ERP Sunrise Clinic** is designed to streamline day-to-day clinic operations with a beautiful chocolate and cream-themed UI. Built with the latest tech stack (Next.js 14 App Router, React 19, and Tailwind CSS v4), this platform provides real-time updates and seamless management tools for the clinic owner, cashiers, and pharmacists.

### ✨ Key Features

- **🛡️ Role-Based Access Control (RBAC):** Tailored, secure interfaces for Owner, Cashier (Kasir), and Pharmacist (Apoteker).
- **📊 Interactive Real-time Dashboards:** Automated polling ensures the Owner Dashboard stays updated with real-time revenue, transaction history, and global reports without page refreshes.
- **💳 Advanced Cashier & POS System:** Complete point-of-sale system featuring automatic promotional pricing, service & product bundling, 2-step checkout, and dynamic EMR queue integrations.
- **🖨️ PDF Export & Reporting:** Clean, professional layouts optimized specifically for printing invoices, global financial reports, and transaction histories.
- **📦 Inventory Management:** Comprehensive tracking of stock levels, low-stock alerts, restock history, and product expiry dates.
- **🧑‍⚕️ Employee & Patient CRM:** Manage staff profiles, doctors, therapists, patient records, and real-time queues.
- **📋 Electronic Medical Records (EMR):** Digital medical records directly integrated with patient profiles, queuing, and billing histories.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on a new device.

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18 or higher) or [Bun](https://bun.sh/)
- [PostgreSQL](https://www.postgresql.org/) (Local or Cloud, e.g., Supabase/Neon)
- Git

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/erp-clinic.git
   cd erp-clinic
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or using bun
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
   npx prisma db push
   # or
   bunx prisma db push
   ```

5. **Seed the Database:**
   Populate the database with initial mock data (services, products, and default users):
   ```bash
   npm run db:seed
   # or
   bun run db:seed
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

After running the seed script, you can log in using the following default accounts to test different role dashboards:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Owner** | `owner@aura.com` | `aura123` |
| **Kasir** | `kasir@aura.com` | `aura123` |
| **Apoteker** | `apoteker@aura.com` | `aura123` |

*(Note: Ensure you change these credentials in a production environment)*

---

## 📜 Available Scripts

- `npm run dev` - Starts the Next.js development server.
- `npm run build` - Builds the application for production deployment.
- `npm run start` - Starts the production server.
- `npm run lint` - Runs ESLint to find and fix code formatting issues.
- `npm run db:push` - Synchronizes your Prisma schema with the database.
- `npm run db:seed` - Executes `prisma/seed.ts` to populate the database.
- `npm run db:studio` - Opens Prisma Studio at `localhost:5555` to view and edit database records via a visual interface.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your Changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the Branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See \`LICENSE\` for more information.

<p align="center">
  <i>Designed with 🤎 for a better healthcare management experience.</i>
</p>
