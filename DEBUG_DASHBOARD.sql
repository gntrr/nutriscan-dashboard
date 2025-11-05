-- ============================================
-- DEBUG DASHBOARD - CEK DATA
-- ============================================
-- Jalankan query ini untuk mengecek kenapa dashboard kosong
-- ============================================

-- 1. CEK APAKAH ADA DATA ANAK DI DATABASE
SELECT 
  '1. Total anak di database' as check_type,
  COUNT(*) as jumlah
FROM public.child_data;

-- 2. CEK APAKAH ADA USER PROFILE
SELECT 
  '2. Total user profiles' as check_type,
  COUNT(*) as jumlah
FROM public.user_profiles;

-- 3. CEK APAKAH ADA DATA DENGAN WILAYAH PUSKESMAS
SELECT 
  '3. Data per wilayah puskesmas' as check_type,
  up.wilayah_puskesmas,
  COUNT(cd.id) as jumlah_anak
FROM public.user_profiles up
LEFT JOIN public.child_data cd ON cd.user_id = up.user_id
GROUP BY up.wilayah_puskesmas
ORDER BY jumlah_anak DESC;

-- 4. CEK APAKAH VIEW nakes_dashboard_overview ADA
SELECT 
  '4. View nakes_dashboard_overview exists?' as check_type,
  COUNT(*) as ada
FROM information_schema.views
WHERE table_schema = 'public' AND table_name = 'nakes_dashboard_overview';

-- 5. CEK ISI VIEW nakes_dashboard_overview
SELECT 
  '5. Isi view nakes_dashboard_overview' as check_type,
  *
FROM public.nakes_dashboard_overview
LIMIT 10;

-- 6. CEK APAKAH VIEW nakes_children_list ADA
SELECT 
  '6. View nakes_children_list exists?' as check_type,
  COUNT(*) as ada
FROM information_schema.views
WHERE table_schema = 'public' AND table_name = 'nakes_children_list';

-- 7. CEK ISI VIEW nakes_children_list
SELECT 
  '7. Isi view nakes_children_list' as check_type,
  nama_balita,
  wilayah_puskesmas,
  kategori_status_gizi
FROM public.nakes_children_list
LIMIT 10;

-- 8. CEK AKUN ADMIN
SELECT 
  '8. Akun admin' as check_type,
  nama_lengkap,
  wilayah_puskesmas,
  role,
  is_active
FROM public.nakes_accounts
WHERE role = 'admin';

-- 9. CEK RLS POLICIES
SELECT 
  '9. RLS Policies' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('child_data', 'user_profiles', 'nakes_accounts')
ORDER BY tablename, policyname;

-- ============================================
-- SOLUSI JIKA VIEW TIDAK ADA
-- ============================================
-- Jika view tidak ada atau error, jalankan SETUP_DASHBOARD_NAKES.sql lagi
-- Atau jalankan query di bawah ini untuk recreate view:

-- DROP VIEW IF EXISTS public.nakes_dashboard_overview CASCADE;
-- DROP VIEW IF EXISTS public.nakes_children_list CASCADE;

-- CREATE VIEW public.nakes_dashboard_overview AS
-- SELECT 
--   na.wilayah_puskesmas,
--   na.kota,
--   na.provinsi,
--   COUNT(DISTINCT cd.id) as total_anak,
--   COUNT(DISTINCT CASE WHEN cd.kategori_status_gizi ILIKE '%buruk%' THEN cd.id END) as gizi_buruk,
--   COUNT(DISTINCT CASE WHEN cd.kategori_status_gizi ILIKE '%kurang%' THEN cd.id END) as gizi_kurang,
--   COUNT(DISTINCT CASE WHEN cd.kategori_status_gizi ILIKE '%normal%' OR cd.kategori_status_gizi ILIKE '%baik%' THEN cd.id END) as gizi_baik,
--   COUNT(DISTINCT CASE WHEN cd.kategori_status_gizi ILIKE '%lebih%' OR cd.kategori_status_gizi ILIKE '%obesitas%' THEN cd.id END) as gizi_lebih,
--   ROUND(AVG(cd.age_months), 1) as rata_rata_usia_bulan,
--   COUNT(DISTINCT CASE WHEN cd.gender = 'male' THEN cd.id END) as jumlah_laki_laki,
--   COUNT(DISTINCT CASE WHEN cd.gender = 'female' THEN cd.id END) as jumlah_perempuan
-- FROM public.nakes_accounts na
-- LEFT JOIN public.user_profiles up ON up.wilayah_puskesmas = na.wilayah_puskesmas
-- LEFT JOIN public.child_data cd ON cd.user_id = up.user_id
-- WHERE na.is_active = true
-- GROUP BY na.wilayah_puskesmas, na.kota, na.provinsi;

-- GRANT SELECT ON public.nakes_dashboard_overview TO authenticated;
