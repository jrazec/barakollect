import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-3 pb-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold font-main text-[var(--espresso-black)]">{title}</h1>
        <p className="text-sm font-accent text-[var(--espresso-black)]">{subtitle}</p>
      </div>
    </div>
  );
};

export default PageHeader;
