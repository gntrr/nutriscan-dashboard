import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ request, locals }) => {
  const nakes = locals.nakes;

  if (!nakes) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const statusGizi = url.searchParams.get('status');
    const gender = url.searchParams.get('gender');
    const minAge = url.searchParams.get('minAge');
    const maxAge = url.searchParams.get('maxAge');
    const priority = url.searchParams.get('priority'); // gizi buruk & kurang only

    // Build query
    let query = supabase
      .from('nakes_children_list')
      .select('*');

    // Filter berdasarkan wilayah (kecuali admin)
    if (nakes.role !== 'admin') {
      query = query.eq('wilayah_puskesmas', nakes.wilayah_puskesmas);
    }

    // Apply filters
    if (priority === 'true') {
      query = query.or('kategori_status_gizi.ilike.%buruk%,kategori_status_gizi.ilike.%kurang%');
    } else if (statusGizi) {
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

    const { data, error } = await query.order('last_checkup', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return new Response('Error fetching data', { status: 500 });
    }

    if (!data || data.length === 0) {
      return new Response('Tidak ada data untuk di-export', { status: 404 });
    }

    // Create CSV
    const headers = [
      'Nama Balita',
      'Nama Ibu',
      'Nama Ayah',
      'Usia (Bulan)',
      'Usia (Tahun)',
      'Jenis Kelamin',
      'Tinggi Badan (cm)',
      'Berat Badan (kg)',
      'Status Gizi',
      'Ambang Batas',
      'Z-Score BB/U',
      'Z-Score PB/U',
      'Z-Score BB/PB',
      'Z-Score IMT/U',
      'Alamat',
      'Wilayah Puskesmas',
      'Kota',
      'Provinsi',
      'Terakhir Checkup',
    ];

    const formatAge = (months: number) => {
      const years = Math.floor(months / 12);
      const remainingMonths = Math.round(months % 12);
      return `${years} tahun ${remainingMonths} bulan`;
    };

    const rows = data.map((row) => [
      row.nama_balita || '-',
      row.nama_ibu || '-',
      row.nama_ayah || '-',
      row.age_months || 0,
      formatAge(row.age_months || 0),
      row.gender === 'male' ? 'Laki-laki' : 'Perempuan',
      row.height_cm || 0,
      row.weight_kg || 0,
      row.kategori_status_gizi || '-',
      row.ambang_batas_z_score || '-',
      row.z_score_bbu?.toFixed(2) || '-',
      row.z_score_pbu?.toFixed(2) || '-',
      row.z_score_bbpb?.toFixed(2) || '-',
      row.z_score_imt?.toFixed(2) || '-',
      (row.alamat || '-').replace(/,/g, ';'), // Replace comma to avoid CSV issues
      row.wilayah_puskesmas || '-',
      row.kota || '-',
      row.provinsi || '-',
      new Date(row.last_checkup).toLocaleDateString('id-ID'),
    ]);

    // Escape CSV values properly
    const escapeCsvValue = (value: any) => {
      const strValue = String(value);
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    };

    const csv = [
      headers.map(escapeCsvValue).join(','),
      ...rows.map((row) => row.map(escapeCsvValue).join(',')),
    ].join('\n');

    // Add BOM for Excel compatibility with UTF-8
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;

    const filename = priority === 'true'
      ? `data-anak-prioritas-${nakes.wilayah_puskesmas}-${new Date().toISOString().split('T')[0]}.csv`
      : statusGizi
      ? `data-anak-${statusGizi}-${nakes.wilayah_puskesmas}-${new Date().toISOString().split('T')[0]}.csv`
      : `data-anak-${nakes.wilayah_puskesmas}-${new Date().toISOString().split('T')[0]}.csv`;

    return new Response(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};
