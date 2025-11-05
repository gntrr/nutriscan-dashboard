# 🗄️ Database Setup - Nakes Dashboard

## Situasi:
✅ Anda sudah punya database NutriScan App dengan tables:
- `user_profiles`
- `child_data`
- `recipe_recommendations`
- `manual_menus`

❌ Anda BELUM punya:
- Table `nakes_accounts` (untuk login nakes/admin ke dashboard)
- RLS policies tambahan (agar nakes bisa lihat data di wilayah mereka)

---

## ⚡ Setup (5 Menit!)

### 1️⃣ Jalankan Script SQL

Buka **Supabase Dashboard** → **SQL Editor**

Copy paste isi file `database-setup.sql` → Klik **Run**

Ini akan:
- ✅ Membuat table `nakes_accounts`
- ✅ Menambahkan RLS policies untuk nakes
- ✅ Membuat views untuk dashboard

### 2️⃣ Buat Admin Account

**A. Buat user di Authentication:**
1. Buka **Authentication** → **Users** → **Add user**
2. Email: `admin@nutriscan.id` (atau terserah)
3. Password: pilih yang kuat
4. **COPY user_id** yang muncul

**B. Tambahkan ke nakes_accounts:**
1. Buka `create-admin-account.sql`
2. Ganti `USER_ID_HERE` dengan user_id tadi
3. Jalankan di SQL Editor

### 3️⃣ Setup Environment Variables

Buat file `.env`:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4️⃣ Run Dashboard

```bash
npm install
npm run dev
```

Buka: `http://localhost:4321`

Login dengan email & password admin!

---

## 🎯 Yang Ditambahkan ke Database:

### Table Baru:
- `nakes_accounts` - Akun nakes & admin

### Policies Baru:
- Nakes bisa lihat `child_data` di wilayah mereka
- Nakes bisa lihat `user_profiles` di wilayah mereka
- Nakes bisa lihat `recipe_recommendations` di wilayah mereka
- Nakes bisa lihat `manual_menus` di wilayah mereka
- Admin bisa lihat SEMUA data

### Views Baru:
- `nakes_dashboard_overview` - Stats per wilayah
- `nakes_children_list` - List anak dengan detail lengkap

---

## ⚠️ PENTING:

- ❌ **TIDAK mengubah** tables yang sudah ada
- ❌ **TIDAK mengubah** data yang sudah ada
- ✅ **HANYA menambah** komponen baru untuk dashboard
- ✅ NutriScan App tetap jalan normal

---

## ✅ Selesai!

Setelah setup, Anda bisa:
- Login sebagai admin
- Lihat data anak dari seluruh Indonesia
- Export laporan
- Manage akun nakes

🎉 **Dashboard siap digunakan!**
