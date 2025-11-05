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

    // Delete nakes account (reject)
    const { error } = await supabase
      .from('nakes_accounts')
      .delete()
      .eq('id', nakesId);

    if (error) {
      console.error('Error rejecting nakes:', error);
      return redirect('/dashboard/admin/nakes?error=rejection_failed');
    }

    return redirect('/dashboard/admin/nakes?success=rejected');
  } catch (error) {
    console.error('Error:', error);
    return redirect('/dashboard/admin/nakes?error=server_error');
  }
};
