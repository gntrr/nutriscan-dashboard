import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email dan password harus diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create server client dengan cookie support
    const supabase = createServerSupabaseClient(cookies);

    // 1. Login via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ error: 'Email atau password salah' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
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
        return new Response(
          JSON.stringify({ error: 'Akun Anda belum terdaftar sebagai tenaga kesehatan. Hubungi administrator untuk pendaftaran.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      } else if (nakesData && !nakesData.is_active) {
        return new Response(
          JSON.stringify({ error: 'Akun Anda tidak aktif. Hubungi administrator untuk aktivasi.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: 'Akun Anda tidak terdaftar sebagai tenaga kesehatan. Log error: ' + (nakesError?.message || 'unknown') }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Success - cookies sudah di-set oleh server client
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        nakes: {
          nama_lengkap: nakesData.nama_lengkap,
          jabatan: nakesData.jabatan,
          wilayah_puskesmas: nakesData.wilayah_puskesmas,
          role: nakesData.role,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
