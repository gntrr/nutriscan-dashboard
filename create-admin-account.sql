-- ============================================
-- BUAT ADMIN ACCOUNT
-- ============================================
-- STEP BY STEP:
-- 
-- 1. Buat user di Supabase Auth Dashboard:
--    - Buka: https://app.supabase.com
--    - Pilih project Anda
--    - Klik: Authentication → Users → Add User
--    - Masukkan email & password
--    - Klik "Create User"
--    - COPY USER_ID yang muncul (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
--
-- 2. Ganti 'USER_ID_HERE' di bawah dengan user_id tadi
-- 3. Jalankan SQL ini di SQL Editor
-- ============================================

INSERT INTO public.nakes_accounts (
  user_id,
  nama_lengkap,
  nip,
  jabatan,
  wilayah_puskesmas,
  kota,
  provinsi,
  role,
  is_active,
  approved_at
) VALUES (
  'USER_ID_HERE',  -- ⬅️ GANTI INI!
  'Admin Utama',
  'ADM001',
  'Administrator',
  'Semua Wilayah',
  'Jakarta',
  'DKI Jakarta',
  'admin',
  true,
  NOW()
);

-- Cek apakah berhasil:
SELECT 
  na.nama_lengkap,
  na.role,
  na.wilayah_puskesmas,
  u.email,
  '✅ Admin berhasil dibuat!' as status
FROM public.nakes_accounts na
JOIN auth.users u ON u.id = na.user_id
WHERE na.role = 'admin';

-- ============================================
-- VERIFICATION
-- ============================================
-- Check if admin account was created successfully

SELECT 
  id,
  nama_lengkap,
  jabatan,
  wilayah_puskesmas,
  role,
  is_active,
  approved_at
FROM public.nakes_accounts
WHERE role = 'admin';

-- ============================================
-- EXAMPLE: Create Regular Nakes Account
-- ============================================
-- For testing purposes, you can create a regular nakes account

-- INSERT INTO public.nakes_accounts (
--   user_id,
--   nama_lengkap,
--   nip,
--   jabatan,
--   wilayah_puskesmas,
--   kota,
--   provinsi,
--   role,
--   is_active,
--   approved_at
-- ) VALUES (
--   'USER_ID_FROM_AUTH',
--   'Dr. Budi Santoso',
--   '197001012000031001',
--   'Dokter Umum',
--   'Puskesmas Gambir',
--   'Jakarta Pusat',
--   'DKI Jakarta',
--   'nakes',
--   true,
--   NOW()
-- );

-- ============================================
-- SUCCESS!
-- ============================================
-- Now you can login with:
-- Email: admin@nutriscan.com (or the email you used)
-- Password: (the password you set)
-- 
-- Then visit: http://localhost:4321/login
-- ============================================
