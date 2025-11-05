import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  // Allow passing a ready-made node OR a component reference to avoid JSX-in-attribute issues in .astro files
  icon?: React.ReactNode;
  iconComponent?: React.ComponentType<{ className?: string }>;
  color: 'red' | 'yellow' | 'green' | 'blue' | 'primary';
  trend?: {
    value: number;
    isUp: boolean;
  };
}

const colorClasses = {
  red: 'from-red-50 to-red-100 text-red-700 border-red-300 hover:shadow-red-200',
  yellow: 'from-orange-50 to-orange-100 text-orange-700 border-orange-300 hover:shadow-orange-200',
  green: 'from-green-50 to-green-100 text-green-700 border-green-300 hover:shadow-green-200',
  blue: 'from-blue-50 to-blue-100 text-blue-700 border-blue-300 hover:shadow-blue-200',
  primary: 'from-[#B8E6E0] to-[#A8D6D0] text-[#2A4A35] border-[#4A7C59] hover:shadow-[#B8E6E0]',
};

export default function StatsCard({ title, value, icon, iconComponent, color, trend }: StatsCardProps) {
  const colorClass = colorClasses[color];
  const Icon = iconComponent;
  const resolvedIcon = icon ?? (Icon ? <Icon className="w-full h-full" /> : null);

  return (
    <div className={`relative overflow-hidden rounded-xl border-2 p-6 bg-gradient-to-br transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer ${colorClass}`}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 opacity-10">
        <div className="transform rotate-12">{resolvedIcon}</div>
      </div>

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold opacity-80 uppercase tracking-wide mb-2">{title}</p>
          <p className="text-5xl font-bold mb-1 transition-all duration-300 hover:scale-105">{value.toLocaleString('id-ID')}</p>
          
          {trend && (
            <div className={`flex items-center mt-3 text-sm font-medium ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isUp ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span className="font-bold">{Math.abs(trend.value)}%</span>
              <span className="ml-1 opacity-75">vs bulan lalu</span>
            </div>
          )}
        </div>
        
        <div className="flex-shrink-0 ml-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-sm shadow-lg">
            <div className="text-3xl opacity-80">
              {resolvedIcon}
            </div>
          </div>
        </div>
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}
