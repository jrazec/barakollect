import React from 'react';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  image?: string; 
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle, actions, image }) => {
  return (
    <div>
      <div className="bg-[var(--espresso-black)] rounded-lg px-6 py-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between shadow text-[var(--parchment)]">
      {image ? (
        <div className="flex items-center gap-4">
          <div>
            <img src={image} alt="Dashboard Image" className="w-16 h-16 rounded-full mb-4 md:mb-0" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-main">{title}</h1>
            <p className="text-xs md:text-sm text-[var(--mocha-beige)] font-accent">{subtitle}</p>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-main">{title}</h1>
          <p className="text-xs md:text-sm text-[var(--mocha-beige)] font-accent">{subtitle}</p>
        </div>
      )}
      <div className="flex gap-2 mt-2 md:mt-0">
        {actions}
      </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
