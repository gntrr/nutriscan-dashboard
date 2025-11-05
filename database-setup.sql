-- ============================================
-- NAKES DASHBOARD - TAMBAHAN SQL
-- ============================================
-- PENTING: Jalankan ini SETELAH schema NutriScan App sudah ada
-- Script ini HANYA menambah table & policies baru untuk dashboard
-- ============================================

-- ============================================
-- 1. TAMBAH TABLE: nakes_accounts
-- ============================================
-- Table untuk akun nakes & admin yang bisa login ke dashboard

CREATE TABLE IF NOT EXISTS public.nakes_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  nama_lengkap VARCHAR(255) NOT NULL,
  nip VARCHAR(50),
  jabatan VARCHAR(100) NOT NULL,
  
  wilayah_puskesmas VARCHAR(255) NOT NULL,
  kota VARCHAR(100) NOT NULL,
  provinsi VARCHAR(100) NOT NULL,
  
  role VARCHAR(20) NOT NULL DEFAULT 'nakes' CHECK (role IN ('nakes', 'admin')),
  is_active BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES public.nakes_accounts(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_nakes_user UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_nakes_accounts_wilayah ON public.nakes_accounts(wilayah_puskesmas);
CREATE INDEX IF NOT EXISTS idx_nakes_accounts_role ON public.nakes_accounts(role);

ALTER TABLE public.nakes_accounts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. POLICIES: nakes_accounts
-- ============================================

DROP POLICY IF EXISTS "Nakes can view own profile" ON public.nakes_accounts;
DROP POLICY IF EXISTS "Admin can view all nakes" ON public.nakes_accounts;
DROP POLICY IF EXISTS "Admin can manage nakes accounts" ON public.nakes_accounts;

CREATE POLICY "Nakes can view own profile"
  ON public.nakes_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all nakes"
  ON public.nakes_accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.nakes_accounts
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

CREATE POLICY "Admin can manage nakes accounts"
  ON public.nakes_accounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.nakes_accounts
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- ============================================
-- 3. TAMBAH POLICY: Nakes bisa lihat child_data
-- ============================================

DROP POLICY IF EXISTS "Nakes can view child data in their region" ON public.child_data;

CREATE POLICY "Nakes can view child data in their region"
  ON public.child_data FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.nakes_accounts na
      JOIN public.user_profiles up ON up.wilayah_puskesmas = na.wilayah_puskesmas
      WHERE na.user_id = auth.uid() AND na.is_active = true 
        AND up.user_id = child_data.user_id
    ) OR
    EXISTS (
      SELECT 1 FROM public.nakes_accounts
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- ============================================
-- 4. TAMBAH POLICY: Nakes bisa lihat user_profiles
-- ============================================

DROP POLICY IF EXISTS "Nakes can view user profiles in their region" ON public.user_profiles;

CREATE POLICY "Nakes can view user profiles in their region"
  ON public.user_profiles FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.nakes_accounts na
      WHERE na.user_id = auth.uid() AND na.is_active = true
        AND na.wilayah_puskesmas = user_profiles.wilayah_puskesmas
    ) OR
    EXISTS (
      SELECT 1 FROM public.nakes_accounts
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- ============================================
-- 5. TAMBAH POLICY: Nakes bisa lihat recipe_recommendations
-- ============================================

DROP POLICY IF EXISTS "Nakes can view recipes in their region" ON public.recipe_recommendations;

CREATE POLICY "Nakes can view recipes in their region"
  ON public.recipe_recommendations FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.nakes_accounts na
      JOIN public.user_profiles up ON up.wilayah_puskesmas = na.wilayah_puskesmas
      WHERE na.user_id = auth.uid() AND na.is_active = true
        AND up.user_id = recipe_recommendations.user_id
    ) OR
    EXISTS (
      SELECT 1 FROM public.nakes_accounts
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- ============================================
-- 6. TAMBAH POLICY: Nakes bisa lihat manual_menus
-- ============================================

DROP POLICY IF EXISTS "Nakes can view manual menus in their region" ON public.manual_menus;

CREATE POLICY "Nakes can view manual menus in their region"
  ON public.manual_menus FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.nakes_accounts na
      JOIN public.user_profiles up ON up.wilayah_puskesmas = na.wilayah_puskesmas
      WHERE na.user_id = auth.uid() AND na.is_active = true
        AND up.user_id = manual_menus.user_id
    ) OR
    EXISTS (
      SELECT 1 FROM public.nakes_accounts
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- ============================================
-- 7. VIEWS untuk Dashboard
-- ============================================

DROP VIEW IF EXISTS public.nakes_dashboard_overview;
DROP VIEW IF EXISTS public.nakes_children_list;

CREATE VIEW public.nakes_dashboard_overview AS
SELECT 
  na.wilayah_puskesmas,
  na.kota,
  na.provinsi,
  COUNT(DISTINCT cd.id) as total_anak,
  COUNT(DISTINCT CASE WHEN cd.kategori_status_gizi ILIKE '%buruk%' THEN cd.id END) as gizi_buruk,
  COUNT(DISTINCT CASE WHEN cd.kategori_status_gizi ILIKE '%kurang%' THEN cd.id END) as gizi_kurang,
  COUNT(DISTINCT CASE WHEN cd.kategori_status_gizi ILIKE '%normal%' OR cd.kategori_status_gizi ILIKE '%baik%' THEN cd.id END) as gizi_baik,
  COUNT(DISTINCT CASE WHEN cd.kategori_status_gizi ILIKE '%lebih%' OR cd.kategori_status_gizi ILIKE '%obesitas%' THEN cd.id END) as gizi_lebih,
  ROUND(AVG(cd.age_months), 1) as rata_rata_usia_bulan,
  COUNT(DISTINCT CASE WHEN cd.gender = 'male' THEN cd.id END) as jumlah_laki_laki,
  COUNT(DISTINCT CASE WHEN cd.gender = 'female' THEN cd.id END) as jumlah_perempuan
FROM public.nakes_accounts na
LEFT JOIN public.user_profiles up ON up.wilayah_puskesmas = na.wilayah_puskesmas
LEFT JOIN public.child_data cd ON cd.user_id = up.user_id
WHERE na.is_active = true
GROUP BY na.wilayah_puskesmas, na.kota, na.provinsi;

CREATE VIEW public.nakes_children_list AS
SELECT 
  cd.id,
  cd.user_id,
  up.nama_balita,
  up.nama_ibu,
  up.nama_ayah,
  up.alamat,
  up.wilayah_puskesmas,
  up.kota,
  up.provinsi,
  cd.age_months,
  cd.gender,
  cd.height_cm,
  cd.weight_kg,
  cd.z_score_bbu,
  cd.z_score_pbu,
  cd.z_score_bbpb,
  cd.z_score_imt,
  cd.kategori_status_gizi,
  cd.ambang_batas_z_score,
  cd.updated_at as last_checkup
FROM public.child_data cd
JOIN public.user_profiles up ON up.user_id = cd.user_id;

GRANT SELECT ON public.nakes_dashboard_overview TO authenticated;
GRANT SELECT ON public.nakes_children_list TO authenticated;

-- ============================================
-- 8. TRIGGER untuk auto-update timestamp
-- ============================================

DROP TRIGGER IF EXISTS set_nakes_accounts_updated_at ON public.nakes_accounts;

CREATE TRIGGER set_nakes_accounts_updated_at
  BEFORE UPDATE ON public.nakes_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SELESAI! ✅
-- ============================================
SELECT '✅ Nakes Dashboard setup complete!' AS status;
