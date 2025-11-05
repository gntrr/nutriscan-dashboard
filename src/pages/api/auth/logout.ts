import type { APIRoute } from 'astro';
import { logoutNakes } from '../../../lib/auth';

export const POST: APIRoute = async ({ redirect }) => {
  try {
    await logoutNakes();
    return redirect('/login');
  } catch (error) {
    return redirect('/login?error=logout_failed');
  }
};
