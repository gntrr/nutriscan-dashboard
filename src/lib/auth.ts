import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface NakesAccount {
  id: string;
  user_id: string;
  nama_lengkap: string;
  nip: string | null;
  jabatan: string;
  wilayah_puskesmas: string;
  kota: string;
  provinsi: string;
  role: 'nakes' | 'admin';
  is_active: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginResult {
  user: User;
  nakes: NakesAccount;
}

/**
 * Login untuk tenaga kesehatan
 */
export async function loginNakes(email: string, password: string): Promise<LoginResult> {
  // 1. Login via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    throw new Error('Email atau password salah');
  }

  // 2. Check if user is nakes
  const { data: nakesData, error: nakesError } = await supabase
    .from('nakes_accounts')
    .select('*')
    .eq('user_id', authData.user.id)
    .eq('is_active', true)
    .single();

  if (nakesError || !nakesData) {
    // Logout if not nakes
    await supabase.auth.signOut();
    
    // Better error message
    if (nakesError?.code === 'PGRST116') {
      // No rows returned - user not in nakes_accounts
      throw new Error('Akun Anda belum terdaftar sebagai tenaga kesehatan. Hubungi administrator untuk pendaftaran.');
    } else if (nakesData && !nakesData.is_active) {
      // User exists but not active
      throw new Error('Akun Anda tidak aktif. Hubungi administrator untuk aktivasi.');
    } else {
      // Other errors
      throw new Error('Akun Anda tidak terdaftar sebagai tenaga kesehatan.');
    }
  }

  return {
    user: authData.user,
    nakes: nakesData,
  };
}

/**
 * Logout
 */
export async function logoutNakes(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error('Gagal logout');
  }
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    return null;
  }
  return session;
}

/**
 * Check nakes role dan wilayah
 */
export async function checkNakesRole(userId: string): Promise<NakesAccount | null> {
  const { data, error } = await supabase
    .from('nakes_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const nakes = await checkNakesRole(userId);
  return nakes?.role === 'admin';
}

/**
 * Get nakes with user session
 */
export async function getNakesFromSession(): Promise<{ user: User; nakes: NakesAccount } | null> {
  const session = await getSession();
  if (!session || !session.user) {
    return null;
  }

  const nakes = await checkNakesRole(session.user.id);
  if (!nakes) {
    return null;
  }

  return {
    user: session.user,
    nakes,
  };
}
