# 📝 RINGKASAN - Yang Perlu Dilakukan

## Masalah
Dashboard belum bisa baca data dari aplikasi NutriScanApp yang sudah live.

## Solusi
Tambahkan table & view di database Supabase (TIDAK mengubah data aplikasi).

---

## 🎯 LANGKAH CEPAT (3 Menit)

### 1️⃣ Setup Database
```
1. Buka Supabase → SQL Editor
2. Copy SEMUA isi file SETUP_DASHBOARD_NAKES.sql
3. Paste & RUN
   
⚠️ PENTING: Jika error "infinite recursion", file sudah diperbaiki.
   Jalankan ulang dari awal atau gunakan FIX_RLS_INFINITE_RECURSION.sql
```

### 2️⃣ Buat Admin
```
1. Buka Supabase → Authentication → Users → Add User
2. Email: admin@nutriscan.com, Password: (terserah)
3. COPY user_id yang muncul
4. Edit file create-admin-account.sql, ganti USER_ID_HERE
5. Jalankan di SQL Editor
```

### 3️⃣ Test
```
1. npm run dev
2. Buka http://localhost:4321/login
3. Login dengan email & password tadi
4. Klik menu "Data Anak"
5. Data dari aplikasi HARUS MUNCUL! ✅
```

---

## 📁 File Penting

- **SETUP_DASHBOARD_NAKES.sql** ← Jalankan ini dulu
- **create-admin-account.sql** ← Buat admin di sini
- **PANDUAN_SETUP.md** ← Panduan lengkap + troubleshooting

---

## ✅ Hasil Akhir

Setelah selesai:
- ✅ Dashboard bisa baca data dari aplikasi NutriScanApp
- ✅ Nakes bisa lihat data anak di wilayahnya
- ✅ Admin bisa lihat semua data
- ✅ Data aplikasi tetap aman (RLS aktif)

**Total waktu: ~3-5 menit** ⏱️
