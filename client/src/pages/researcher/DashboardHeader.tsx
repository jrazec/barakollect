import React from 'react';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="bg-[var(--espresso-black)] rounded-lg px-6 py-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between shadow text-[var(--parchment)]">
      <div>
        <h1 className="text-xl md:text-2xl font-bold font-main">{title}</h1>
        <p className="text-xs md:text-sm text-[var(--mocha-beige)] font-accent">{subtitle}</p>
      </div>
      <div className="flex gap-2 mt-2 md:mt-0">
        {actions}
      </div>
    </div>
  );
};

export default DashboardHeader;
