import { createClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Global client untuk client-side operations (tanpa auth)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Create Supabase client with cookie support untuk SSR
 * Digunakan di middleware dan API routes
 */
export function createServerSupabaseClient(cookies: AstroCookies) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: {
        getItem: (key: string) => {
          return cookies.get(key)?.value ?? null;
        },
        setItem: (key: string, value: string) => {
          cookies.set(key, value, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: 'lax',
            secure: import.meta.env.PROD,
          });
        },
        removeItem: (key: string) => {
          cookies.delete(key, { path: '/' });
        },
      },
    },
  });
}
