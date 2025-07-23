import React from 'react';

interface PageHeaderWithFilterProps {
  title: string;
  subtitle: string;
  filterOptions?: string[];
}

const PageHeaderWithFilter: React.FC<PageHeaderWithFilterProps> = ({ title, subtitle, filterOptions = [] }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold font-main text-[var(--espresso-black)]">{title}</h1>
        <p className="text-sm font-accent text-[var(--espresso-black)]">{subtitle}</p>
      </div>
      {filterOptions.length > 0 && (
        <div className="mt-2 md:mt-0">
          <select className="border border-[var(--mocha-beige)] rounded px-3 py-1 text-xs font-accent bg-white text-[var(--arabica-brown)] focus:outline-none">
            {filterOptions.map((option, index) => (
              <option key={index}>{option}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default PageHeaderWithFilter;
