-- ============================================
-- FIX: Infinite Recursion di RLS Policy
-- ============================================
-- Error: "infinite recursion detected in policy for relation nakes_accounts"
-- Penyebab: Policy yang cek role admin query ke table yang sama
-- ============================================

-- STEP 1: Drop semua policy yang bermasalah
DROP POLICY IF EXISTS "Nakes can view own profile" ON public.nakes_accounts;
DROP POLICY IF EXISTS "Admin can view all nakes" ON public.nakes_accounts;
DROP POLICY IF EXISTS "Admin can manage nakes accounts" ON public.nakes_accounts;
DROP POLICY IF EXISTS "Users can insert own nakes accounts" ON public.nakes_accounts;

-- STEP 2: Buat function untuk cek role (SECURITY DEFINER - bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.nakes_accounts
    WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3: Buat policy baru yang TIDAK recursif

-- Policy 1: Nakes bisa lihat profil sendiri
CREATE POLICY "Nakes can view own profile"
  ON public.nakes_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Admin bisa lihat semua (pakai function)
CREATE POLICY "Admin can view all nakes"
  ON public.nakes_accounts
  FOR SELECT
  USING (public.is_admin());

-- Policy 3: Admin bisa insert
CREATE POLICY "Admin can insert nakes"
  ON public.nakes_accounts
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Policy 4: Admin bisa update
CREATE POLICY "Admin can update nakes"
  ON public.nakes_accounts
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policy 5: Admin bisa delete
CREATE POLICY "Admin can delete nakes"
  ON public.nakes_accounts
  FOR DELETE
  USING (public.is_admin());

-- STEP 4: Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- STEP 5: Verifikasi
SELECT 
  schemaname,
  tablename,
  policyname,
  '✅ Policy berhasil dibuat' as status
FROM pg_policies
WHERE tablename = 'nakes_accounts';

-- ============================================
-- PENJELASAN:
-- ============================================
-- SECURITY DEFINER function (is_admin) akan:
-- 1. Dijalankan dengan hak akses OWNER (bypass RLS)
-- 2. Tidak trigger policy lagi saat query nakes_accounts
-- 3. Menghindari infinite recursion
-- 
-- Policy sekarang pakai is_admin() yang aman
-- ============================================
