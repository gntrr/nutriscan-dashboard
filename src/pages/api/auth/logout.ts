import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ redirect, cookies }) => {
  try {
    const supabase = createServerSupabaseClient(cookies);
    await supabase.auth.signOut();
    return redirect('/login');
  } catch (error) {
    return redirect('/login?error=logout_failed');
  }
};
