import React from 'react';

const AnalysisFooter: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2 justify-between items-center mt-4">
      <button className="border border-[var(--arabica-brown)] bg-white text-[var(--arabica-brown)] px-3 py-1 rounded font-main text-xs shadow flex items-center gap-1">
        <span>&#128260;</span> Reset Filters
      </button>
      <div className="flex gap-2">
        <button className="border border-[var(--arabica-brown)] bg-white text-[var(--arabica-brown)] px-3 py-1 rounded font-main text-xs shadow flex items-center gap-1">
          <span>&#128190;</span> Export Data
        </button>
        <button className="bg-[var(--espresso-black)] text-[var(--parchment)] px-3 py-1 rounded font-main text-xs shadow">
          Save Analysis
        </button>
      </div>
    </div>
  );
};

export default AnalysisFooter;
