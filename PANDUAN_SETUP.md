# 🚀 PANDUAN SETUP DASHBOARD NAKES

## Situasi Saat Ini
✅ **Aplikasi NutriScanApp sudah live** dengan data di Supabase  
✅ **Database sudah ada**: `user_profiles`, `child_data`, dll  
❌ **Dashboard belum bisa baca data** dari aplikasi  

## Masalahnya
Dashboard nakes butuh **table tambahan** dan **view** untuk bisa membaca data dari aplikasi NutriScanApp.

---

## 📋 LANGKAH SETUP (HANYA 3 LANGKAH!)

### **LANGKAH 1: Setup Database Dashboard**

1. Buka **Supabase Dashboard**: https://app.supabase.com
2. Pilih project NutriScan Anda
3. Klik **SQL Editor** di sidebar kiri
4. Copy semua isi file `SETUP_DASHBOARD_NAKES.sql`
5. Paste & klik **RUN**
6. Tunggu sampai selesai ✅

**Apa yang dilakukan?**
- Membuat table `nakes_accounts` untuk akun nakes/admin
- Membuat view `nakes_children_list` untuk gabungan data anak + profil orang tua
- Membuat view `nakes_dashboard_overview` untuk statistik
- Menambahkan RLS policies agar nakes hanya bisa lihat data di wilayahnya

---

### **LANGKAH 2: Buat Akun Admin**

1. Di Supabase Dashboard, klik **Authentication → Users**
2. Klik tombol **Add User**
3. Masukkan:
   - Email: `admin@nutriscan.com` (atau email pilihan Anda)
   - Password: (pilih password yang kuat)
   - ☑️ Centang "Auto Confirm User"
4. Klik **Create User**
5. **COPY USER ID** yang muncul (format UUID panjang)

6. Kembali ke **SQL Editor**
7. Buka file `create-admin-account.sql`
8. Ganti `'USER_ID_HERE'` dengan user_id yang tadi Anda copy
9. Klik **RUN**
10. Cek apakah berhasil (akan ada hasil query dengan nama admin)

---

### **LANGKAH 3: Test Login**

1. Pastikan project dashboard sudah running:
   ```bash
   npm run dev
   ```

2. Buka browser: `http://localhost:4321/login`

3. Login dengan:
   - Email: `admin@nutriscan.com` (atau email yang Anda buat)
   - Password: (password yang Anda set)

4. Setelah login, Anda akan masuk ke dashboard

5. **CEK DATA ANAK**: 
   - Klik menu **Data Anak**
   - Data dari aplikasi NutriScanApp **HARUS SUDAH MUNCUL** di sini! ✅

---

## 🔍 Troubleshooting

### ❌ Error: "infinite recursion detected in policy for relation nakes_accounts"

**Solusi:** File `SETUP_DASHBOARD_NAKES.sql` sudah diperbaiki untuk menghindari masalah ini.

Jika Anda sudah pernah jalankan versi lama, jalankan ini untuk fix:
```sql
-- Jalankan di SQL Editor
-- File: FIX_RLS_INFINITE_RECURSION.sql
```

**Penjelasan:**
- Policy lama menggunakan `EXISTS (SELECT ... FROM nakes_accounts)` di dalam policy `nakes_accounts` itu sendiri
- Ini menyebabkan infinite loop
- Solusi: Gunakan `SECURITY DEFINER` function yang bypass RLS

---

### ❌ Data anak masih kosong?

**Cek 1: Apakah ada data di aplikasi?**
```sql
-- Jalankan di SQL Editor
SELECT COUNT(*) as total_anak FROM public.child_data;
SELECT COUNT(*) as total_profil FROM public.user_profiles;
```
Jika hasilnya 0, berarti belum ada data dari aplikasi.

**Cek 2: Apakah field `wilayah_puskesmas` ada di `user_profiles`?**
```sql
-- Jalankan di SQL Editor
SELECT 
  nama_balita,
  wilayah_puskesmas,
  kota
FROM public.user_profiles
LIMIT 5;
```
Jika error atau kosong, berarti field ini belum ada/belum diisi di aplikasi.

**Cek 3: Apakah view berhasil dibuat?**
```sql
-- Jalankan di SQL Editor
SELECT * FROM public.nakes_children_list LIMIT 5;
```
Jika error, berarti view belum berhasil dibuat. Ulangi LANGKAH 1.

---

### ❌ Error saat login?

**Cek 1: Apakah akun admin sudah dibuat?**
```sql
-- Jalankan di SQL Editor
SELECT 
  nama_lengkap,
  role,
  is_active,
  u.email
FROM public.nakes_accounts na
JOIN auth.users u ON u.id = na.user_id
WHERE role = 'admin';
```

**Cek 2: Apakah `.env` sudah benar?**
Pastikan file `.env` di root project berisi:
```env
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 🎯 Yang Penting

1. **Database NutriScanApp TIDAK DIUBAH** - Dashboard hanya menambahkan table & view baru
2. **Data dari aplikasi TETAP AMAN** - RLS policies memastikan nakes hanya bisa lihat data di wilayahnya
3. **Hanya butuh 3 langkah** - Setup database → Buat admin → Login & test

---

## 📞 Butuh Bantuan?

Jika masih ada masalah, jalankan query ini dan kirim hasilnya:

```sql
-- Diagnostic query
SELECT 
  'child_data' as table_name,
  COUNT(*) as jumlah_row
FROM public.child_data
UNION ALL
SELECT 
  'user_profiles',
  COUNT(*)
FROM public.user_profiles
UNION ALL
SELECT 
  'nakes_accounts',
  COUNT(*)
FROM public.nakes_accounts
UNION ALL
SELECT 
  'nakes_children_list (view)',
  COUNT(*)
FROM public.nakes_children_list;
```

---

## ✅ Checklist

- [ ] Jalankan `SETUP_DASHBOARD_NAKES.sql`
- [ ] Buat user di Supabase Auth
- [ ] Jalankan `create-admin-account.sql` dengan user_id yang benar
- [ ] Test login di `http://localhost:4321/login`
- [ ] Cek apakah data anak muncul di dashboard

**Setelah semua ✅, dashboard siap digunakan!** 🎉
