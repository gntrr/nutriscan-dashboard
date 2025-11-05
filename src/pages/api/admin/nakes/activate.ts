import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const nakes = locals.nakes;

  if (!nakes || nakes.role !== 'admin') {
    return redirect('/dashboard?error=forbidden');
  }

  try {
    const formData = await request.formData();
    const nakesId = formData.get('nakes_id')?.toString();

    if (!nakesId) {
      return redirect('/dashboard/admin/nakes?error=missing_id');
    }

    // Activate nakes account
    const { error } = await supabase
      .from('nakes_accounts')
      .update({
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', nakesId);

    if (error) {
      console.error('Error activating nakes:', error);
      return redirect('/dashboard/admin/nakes?error=activation_failed');
    }

    return redirect('/dashboard/admin/nakes?success=activated');
  } catch (error) {
    console.error('Error:', error);
    return redirect('/dashboard/admin/nakes?error=server_error');
  }
};
