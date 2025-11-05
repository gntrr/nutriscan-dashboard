import type { APIRoute } from 'astro';
import { loginNakes } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email dan password harus diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Login via auth helper
    const { user, nakes } = await loginNakes(email, password);

    // Success
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
        },
        nakes: {
          nama_lengkap: nakes.nama_lengkap,
          jabatan: nakes.jabatan,
          wilayah_puskesmas: nakes.wilayah_puskesmas,
          role: nakes.role,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
