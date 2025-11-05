import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatusGiziChartProps {
  data: {
    gizi_buruk: number;
    gizi_kurang: number;
    gizi_baik: number;
    gizi_lebih: number;
  };
}

const COLORS = {
  'Gizi Buruk': '#DC2626',
  'Gizi Kurang': '#F59E0B',
  'Gizi Baik': '#10B981',
  'Gizi Lebih': '#3B82F6',
};

export default function StatusGiziChart({ data }: StatusGiziChartProps) {
  const chartData = [
    { name: 'Gizi Buruk', value: data.gizi_buruk },
    { name: 'Gizi Kurang', value: data.gizi_kurang },
    { name: 'Gizi Baik', value: data.gizi_baik },
    { name: 'Gizi Lebih', value: data.gizi_lebih },
  ].filter(item => item.value > 0);

  const total = data.gizi_buruk + data.gizi_kurang + data.gizi_baik + data.gizi_lebih;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Tidak ada data untuk ditampilkan</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {chartData.map((item) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={item.name} className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] }}
              />
              <div>
                <p className="text-sm font-medium text-gray-700">{item.name}</p>
                <p className="text-lg font-bold">{item.value} <span className="text-sm text-gray-500">({percentage}%)</span></p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
