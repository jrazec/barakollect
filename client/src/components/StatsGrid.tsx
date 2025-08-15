import React from 'react';
import StatCard from './StatCard';
import type { Stat } from '@/interfaces/global';


interface StatsGridProps {
  stats: Stat[];
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          label={stat.label}
          value={stat.value}
          subtext={stat.subtext}
        />
      ))}
    </div>
  );
};

export default StatsGrid;
