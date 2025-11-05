# 🏥 NutriScan Nakes Dashboard

Dashboard web untuk Tenaga Kesehatan (Nakes) untuk monitoring dan pelaporan data gizi anak dari aplikasi NutriScan.

## � Features

### Untuk Nakes (Tenaga Kesehatan)
- ✅ **Dashboard Overview** - Lihat statistik gizi anak di wilayah Anda
- ✅ **Data Anak** - List dan detail lengkap data anak dengan filter & pagination
- ✅ **Laporan & Export** - Export data ke CSV untuk pelaporan
- ✅ **Wilayah-based Access** - Hanya lihat data di wilayah puskesmas Anda

### Untuk Admin
- ✅ **Analytics Indonesia-wide** - Statistik untuk seluruh Indonesia
- ✅ **Kelola Nakes** - Approve, deactivate, manage akun nakes
- ✅ **Top 10 Wilayah** - Monitor wilayah dengan gizi buruk terbanyak
- ✅ **Stats per Provinsi** - Breakdown data per provinsi

## 🚀 Tech Stack

- **Framework**: [Astro](https://astro.build) v5 (SSR mode)
- **UI Library**: [React](https://react.dev) v18
- **Styling**: [TailwindCSS](https://tailwindcss.com) v3
- **Database**: [Supabase](https://supabase.com) (PostgreSQL + RLS)
- **Charts**: [Recharts](https://recharts.org)
- **Deployment**: Vercel

## 📦 Installation

### Prerequisites
- Node.js 18+
- Supabase project (sudah ada dari NutriScanApp)
- Git

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Setup environment variables**

Create `.env.local` file:
```bash
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. **Setup database** (IMPORTANT!)

Run the SQL scripts from `NAKES_DASHBOARD_REQUIREMENTS.md`:
- Create `nakes_accounts` table
- Update RLS policies
- Create database views

4. **Create first admin account**

See `NAKES_DASHBOARD_REQUIREMENTS.md` for SQL script

5. **Run development server**
```bash
npm run dev
```

Visit: `http://localhost:4321`

## 🧞 Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Installs dependencies |
| `npm run dev` | Starts local dev server at `localhost:4321` |
| `npm run build` | Build your production site to `./dist/` |
| `npm run preview` | Preview your build locally, before deploying |

## 🚢 Deployment

Deploy to Vercel:
```bash
vercel
```

Set environment variables in Vercel Dashboard.

## � License

Copyright © 2025 NutriScan. All rights reserved.

---

**Version**: 1.0.0  
**Status**: Production Ready ✅
