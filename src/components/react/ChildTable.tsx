import React, { useState, useEffect } from 'react';
import { Search, Filter, UserX, ArrowRight, Loader2, Users } from 'lucide-react';

interface Child {
  id: string;
  nama_balita: string;
  nama_ibu: string;
  age_months: number;
  gender: string;
  kategori_status_gizi: string;
  alamat: string;
  last_checkup: string;
}

interface ChildTableProps {
  wilayahPuskesmas: string;
}

export default function ChildTable({ wilayahPuskesmas }: ChildTableProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchChildren();
  }, [currentPage, searchQuery, statusFilter, genderFilter]);

  const fetchChildren = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (genderFilter) params.append('gender', genderFilter);

      const response = await fetch(`/api/children/list?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data');
      }

      const result = await response.json();
      setChildren(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchChildren();
  };

  const getStatusBadgeClass = (status: string) => {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus.includes('buruk')) return 'badge-gizi-buruk';
    if (lowerStatus.includes('kurang')) return 'badge-gizi-kurang';
    if (lowerStatus.includes('lebih') || lowerStatus.includes('obesitas')) return 'badge-gizi-lebih';
    return 'badge-gizi-baik';
  };

  const formatAge = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = Math.round(months % 12);
    return `${years} thn ${remainingMonths} bln`;
  };

  if (loading && children.length === 0) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton for Filters */}
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Loading Skeleton for Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <th key={i} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters with Icons */}
      <div className="card bg-gradient-to-br from-white to-gray-50 shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-[#4A7C59]" />
            <h3 className="text-lg font-semibold text-gray-900">Filter Data</h3>
          </div>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Cari Nama/Alamat
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Masukkan nama anak atau alamat..."
                  className="input-field pl-10"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status Gizi (Berdasarkan IMT)
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field"
              >
                <option value="">Semua Status</option>
                <option value="buruk">Gizi Buruk</option>
                <option value="kurang">Gizi Kurang</option>
                <option value="baik">Gizi Baik</option>
                <option value="lebih">Gizi Lebih</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jenis Kelamin
              </label>
              <select
                value={genderFilter}
                onChange={(e) => {
                  setGenderFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field"
              >
                <option value="">Semua</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
          </form>
        </div>
      </div>

      {/* Table with Enhanced Styling & Constrained Width */}
      <div className="card overflow-hidden shadow-lg">
        <div className="overflow-x-auto max-w-full">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gradient-to-r from-[#4A7C59] to-[#3A6249] sticky top-0 z-10">
              <tr>
                <th className="w-48 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Nama Anak
                </th>
                <th className="w-44 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Nama Ibu
                </th>
                <th className="w-32 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Usia
                </th>
                <th className="w-36 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Jenis Kelamin
                </th>
                <th className="w-40 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Status Gizi (Berdasarkan IMT)
                </th>
                <th className="w-40 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Terakhir Checkup
                </th>
                <th className="w-36 px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {children.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16">
                    <div className="text-center space-y-4">
                      <div className="inline-block p-6 bg-gray-100 rounded-full">
                        <UserX className="w-16 h-16 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Tidak Ada Data Ditemukan
                        </h3>
                        <p className="text-gray-500">
                          Coba ubah filter atau kata kunci pencarian Anda
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('');
                          setGenderFilter('');
                          setCurrentPage(1);
                        }}
                        className="btn-primary inline-flex items-center space-x-2"
                      >
                        <Filter className="w-4 h-4" />
                        <span>Reset Filter</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                children.map((child, idx) => (
                  <tr 
                    key={child.id} 
                    className="hover:bg-gradient-to-r hover:from-[#4A7C59]/5 hover:to-transparent transition-all duration-200 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-[#4A7C59] to-[#3A6249] flex items-center justify-center text-white font-bold">
                          {child.nama_balita?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {child.nama_balita || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 truncate">
                        {child.nama_ibu || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {formatAge(child.age_months)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                        child.gender === 'male' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-pink-100 text-pink-800'
                      }`}>
                        {child.gender === 'male' ? '👦 Laki-laki' : '👧 Perempuan'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${getStatusBadgeClass(child.kategori_status_gizi)} whitespace-nowrap`}>
                        {child.kategori_status_gizi}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(child.last_checkup).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <a
                        href={`/dashboard/anak/${child.id}`}
                        className="inline-flex items-center space-x-1 text-[#4A7C59] hover:text-[#3A6249] font-semibold group-hover:underline transition-all"
                      >
                        <span>Lihat Detail</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination with Better Design */}
        {totalPages > 1 && (
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700">
                Halaman <span className="font-bold text-[#4A7C59]">{currentPage}</span> dari{' '}
                <span className="font-bold text-[#4A7C59]">{totalPages}</span>
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-5 py-2.5 border-2 border-[#4A7C59] rounded-lg text-sm font-semibold text-[#4A7C59] bg-white hover:bg-[#4A7C59] hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#4A7C59]"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-5 py-2.5 border-2 border-[#4A7C59] rounded-lg text-sm font-semibold text-white bg-[#4A7C59] hover:bg-[#3A6249] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && children.length > 0 && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-[#4A7C59] animate-spin" />
            <p className="text-gray-700 font-semibold">Memuat data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
