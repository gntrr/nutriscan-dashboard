import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ request, locals }) => {
  const nakes = locals.nakes;

  if (!nakes) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(request.url);
    const statusGizi = url.searchParams.get('status');
    const gender = url.searchParams.get('gender');
    const minAge = url.searchParams.get('minAge');
    const maxAge = url.searchParams.get('maxAge');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    // Build query - Nakes hanya bisa lihat data di wilayahnya
    let query = supabase
      .from('nakes_children_list')
      .select('*', { count: 'exact' });

    // Filter berdasarkan wilayah (RLS will handle this, but we add it explicitly)
    if (nakes.role !== 'admin') {
      query = query.eq('wilayah_puskesmas', nakes.wilayah_puskesmas);
    }

    // Apply filters
    if (statusGizi) {
      query = query.ilike('kategori_status_gizi', `%${statusGizi}%`);
    }
    if (gender) {
      query = query.eq('gender', gender);
    }
    if (minAge) {
      query = query.gte('age_months', parseFloat(minAge));
    }
    if (maxAge) {
      query = query.lte('age_months', parseFloat(maxAge));
    }
    if (search) {
      query = query.or(`nama_balita.ilike.%${search}%,alamat.ilike.%${search}%,nama_ibu.ilike.%${search}%`);
    }

    // Get total count
    const { count } = await query;

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Get data with pagination
    query = query
      .range(from, to)
      .order('last_checkup', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        data,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
