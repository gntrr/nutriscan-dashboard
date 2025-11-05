# 🔍 Troubleshooting: Dashboard Kosong

## Masalah
Dashboard menampilkan:
- "Tidak ada data untuk ditampilkan" pada chart
- Nilai 0 atau "-" pada statistik (Total Anak, Gizi Buruk, dll)
- Rata-rata usia kosong

## Penyebab Umum

### 1. **View Database Belum Dibuat**
View `nakes_dashboard_overview` dan `nakes_children_list` belum dibuat di Supabase.

### 2. **Tidak Ada Data Anak dari Aplikasi**
Belum ada orang tua yang mendaftarkan anak mereka melalui aplikasi NutriScanApp.

### 3. **Wilayah Puskesmas Tidak Match**
Wilayah puskesmas di akun nakes berbeda dengan data di `user_profiles`.

---

## 🛠️ Langkah Troubleshooting

### **LANGKAH 1: Jalankan Debug Query**

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Copy semua isi file `DEBUG_DASHBOARD.sql`
3. Paste & Run
4. Perhatikan hasil query:

#### Hasil yang Diharapkan:

```
Query 1: Total anak di database
- Jika > 0: ✅ Ada data anak
- Jika = 0: ❌ Belum ada data anak (tunggu orang tua input di app)

Query 2: Total user profiles
- Jika > 0: ✅ Ada profil user
- Jika = 0: ❌ Belum ada data profil

Query 3: Data per wilayah puskesmas
- Cek apakah ada data di wilayah Anda
- Jika kosong: ❌ Wilayah tidak match

Query 4 & 5: View nakes_dashboard_overview
- Jika ada = 1: ✅ View sudah dibuat
- Jika ada = 0: ❌ View belum dibuat
- Jika isi kosong: ❌ Tidak ada data untuk agregasi

Query 6 & 7: View nakes_children_list
- Jika ada = 1: ✅ View sudah dibuat
- Jika ada = 0: ❌ View belum dibuat

Query 8: Akun admin
- Cek wilayah_puskesmas admin
- Jika "Semua Wilayah": Admin akan lihat semua data

Query 9: RLS Policies
- Pastikan policies ada untuk child_data dan user_profiles
```

---

### **LANGKAH 2: Fix Berdasarkan Hasil Debug**

#### ✅ **Jika View Belum Dibuat**

Jalankan file `SETUP_DASHBOARD_NAKES.sql` lagi:
```sql
-- Di SQL Editor Supabase
-- Copy paste semua isi SETUP_DASHBOARD_NAKES.sql
-- Klik RUN
```

#### ✅ **Jika Tidak Ada Data Anak**

**Opsi 1: Tunggu Data dari Aplikasi**
- Instruksikan orang tua untuk mendaftarkan anak mereka via aplikasi NutriScanApp
- Data akan otomatis muncul di dashboard

**Opsi 2: Insert Data Dummy untuk Testing**
```sql
-- Jalankan di SQL Editor
-- 1. Buat user dummy
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- 2. Ambil user_id yang baru dibuat
SELECT id FROM auth.users WHERE email = 'test@example.com';

-- 3. Insert user_profile (ganti 'USER_ID_TADI' dengan hasil query di atas)
INSERT INTO public.user_profiles (user_id, nama_ibu, nama_balita, wilayah_puskesmas, kota, provinsi, alamat)
VALUES (
  'USER_ID_TADI',
  'Ibu Test',
  'Anak Test',
  'Semua Wilayah', -- GANTI dengan wilayah puskesmas Anda
  'Jakarta',
  'DKI Jakarta',
  'Jl. Test No. 123'
);

-- 4. Insert child_data
INSERT INTO public.child_data (user_id, age_months, gender, height_cm, weight_kg, z_score_bbu, z_score_pbu, z_score_bbpb, z_score_imt, kategori_status_gizi, ambang_batas_z_score)
VALUES (
  'USER_ID_TADI',
  24, -- 2 tahun
  'male',
  85.5,
  12.3,
  -1.5,
  -1.2,
  -0.8,
  -0.9,
  'Gizi Baik (Normal)',
  '-2 SD s/d +1 SD'
);
```

#### ✅ **Jika Wilayah Tidak Match**

**Opsi 1: Update Wilayah Admin**
```sql
-- Ubah wilayah admin menjadi salah satu wilayah yang ada data
UPDATE public.nakes_accounts
SET wilayah_puskesmas = 'Puskesmas XXX' -- ganti dengan wilayah yang ada data
WHERE role = 'admin';
```

**Opsi 2: Update Wilayah di Data User Profiles**
```sql
-- Lihat wilayah admin
SELECT wilayah_puskesmas FROM public.nakes_accounts WHERE role = 'admin';

-- Update user_profiles agar match dengan wilayah admin
UPDATE public.user_profiles
SET wilayah_puskesmas = 'WILAYAH_ADMIN'
WHERE user_id IN (
  SELECT user_id FROM public.child_data LIMIT 10
);
```

---

### **LANGKAH 3: Verifikasi**

Setelah fix, coba query ini untuk memastikan data sudah muncul:

```sql
-- Cek apakah view sudah ada data
SELECT * FROM public.nakes_dashboard_overview;

-- Cek apakah children list sudah ada data
SELECT * FROM public.nakes_children_list LIMIT 10;
```

Jika sudah ada data, **refresh dashboard** di browser (Ctrl + F5).

---

## 📝 Checklist

- [ ] Jalankan `DEBUG_DASHBOARD.sql`
- [ ] Pastikan view `nakes_dashboard_overview` dan `nakes_children_list` sudah dibuat
- [ ] Pastikan ada data anak di database
- [ ] Pastikan wilayah puskesmas match antara nakes dan user_profiles
- [ ] Refresh dashboard (Ctrl + F5)
- [ ] Data muncul di dashboard ✅

---

## 💡 Tips

1. **Untuk Admin**: Admin dengan wilayah "Semua Wilayah" akan melihat semua data dari seluruh Indonesia
2. **Untuk Nakes Biasa**: Hanya akan melihat data anak di wilayah puskesmas mereka
3. **Real-time**: Data akan update otomatis saat ada input baru dari aplikasi NutriScanApp
4. **RLS Active**: Row Level Security memastikan nakes hanya bisa lihat data di wilayah mereka

---

## 🆘 Masih Bermasalah?

Jalankan query ini dan kirim hasilnya untuk debugging lebih lanjut:

```sql
-- Full diagnostic
SELECT 
  'child_data' as tabel,
  COUNT(*) as jumlah_row,
  COUNT(DISTINCT user_id) as jumlah_user,
  MIN(created_at) as data_tertua,
  MAX(created_at) as data_terbaru
FROM public.child_data
UNION ALL
SELECT 
  'user_profiles',
  COUNT(*),
  COUNT(DISTINCT user_id),
  MIN(created_at),
  MAX(created_at)
FROM public.user_profiles
UNION ALL
SELECT 
  'nakes_accounts',
  COUNT(*),
  COUNT(DISTINCT user_id),
  MIN(created_at),
  MAX(created_at)
FROM public.nakes_accounts;
```
