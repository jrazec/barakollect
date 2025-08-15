import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subtext = "from last month" }) => {
  return (
    <div className="bg-[var(--arabica-brown)] rounded-lg p-4 text-center shadow text-[var(--parchment)]">
      <div className="text-xs font-accent mb-1">{label}</div>
      <div className="text-2xl font-bold font-main">{value}</div>
      <div className="text-xs font-accent">{subtext}</div>
    </div>
  );
};

export default StatCard;
