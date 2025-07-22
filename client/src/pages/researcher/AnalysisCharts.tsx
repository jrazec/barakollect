import React from 'react';

interface AnalysisChartsProps {
  activeTab: string;
}

const chartsByTab: Record<string, React.ReactNode> = {
  Morphological: (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Monthly Morphological Trends */}
      <div className="bg-[var(--parchment)] rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">&#128202;</span>
          <span className="font-main font-bold text-[var(--espresso-black)] text-sm">Monthly Morphological Trends</span>
        </div>
        <div className="text-xs font-accent text-[var(--espresso-black)] mb-2">Monthly Morphological Trends</div>
        <div className="flex items-center justify-center h-40">
          <span className="text-stone-400">[Line Chart]</span>
        </div>
        <div className="flex gap-2 mt-2 text-xs text-stone-400">
          <span>area</span>
          <span>perimeter</span>
        </div>
      </div>
      {/* Size Distribution Box Plot */}
      <div className="bg-[var(--parchment)] rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">&#128202;</span>
          <span className="font-main font-bold text-[var(--espresso-black)] text-sm">Size Distribution Box Plot</span>
        </div>
        <div className="text-xs font-accent text-[var(--espresso-black)] mb-2">Monthly Morphological Trends</div>
        <div className="flex items-center justify-center h-40">
          <span className="text-stone-400">[Box Plot]</span>
        </div>
        <div className="flex gap-2 mt-2 text-xs text-stone-400">
          <span>Libérica</span>
          <span>Excelsa</span>
        </div>
      </div>
      {/* Major vs Minor Axis Scatter Plot */}
      <div className="bg-[var(--parchment)] rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">&#128202;</span>
          <span className="font-main font-bold text-[var(--espresso-black)] text-sm">Major vs Minor Axis Scatter Plot</span>
        </div>
        <div className="text-xs font-accent text-[var(--espresso-black)] mb-2">12mm</div>
        <div className="flex items-center justify-center h-40">
          <span className="text-stone-400">[Scatter Plot]</span>
        </div>
        <div className="flex gap-2 mt-2 text-xs text-stone-400">
          <span>Libérica</span>
          <span>Excelsa</span>
        </div>
      </div>
      {/* Feature Correlation Matrix */}
      <div className="bg-[var(--parchment)] rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">&#128202;</span>
          <span className="font-main font-bold text-[var(--espresso-black)] text-sm">Feature Correlation Matrix</span>
        </div>
        <div className="text-xs font-accent text-[var(--espresso-black)] mb-2">Length, Width, Area, Perimeter</div>
        <div className="flex items-center justify-center h-40">
          <span className="text-stone-400">[Correlation Matrix]</span>
        </div>
        <div className="text-xs text-stone-400 mt-2">Darker color = stronger correlation</div>
      </div>
    </div>
  ),
  Distributions: (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Bean Type Distribution */}
      <div className="bg-[var(--parchment)] rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">&#128202;</span>
          <span className="font-main font-bold text-[var(--espresso-black)] text-sm">Bean Type Distribution</span>
        </div>
        <div className="text-xs font-accent text-[var(--espresso-black)] mb-2">Libérica: 65%</div>
        <div className="flex items-center justify-center h-40">
          <span className="text-stone-400">[Pie Chart]</span>
        </div>
        <div className="flex gap-2 mt-2 text-xs text-stone-400">
          <span>Libérica</span>
          <span>Excelsa</span>
          <span>Unclassified</span>
        </div>
      </div>
      {/* Size Distribution by Variety */}
      <div className="bg-[var(--parchment)] rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">&#128202;</span>
          <span className="font-main font-bold text-[var(--espresso-black)] text-sm">Size Distribution by Variety</span>
        </div>
        <div className="text-xs font-accent text-[var(--espresso-black)] mb-2">Size Distribution</div>
        <div className="flex items-center justify-center h-40">
          <span className="text-stone-400">[Bar Chart]</span>
        </div>
        <div className="flex gap-2 mt-2 text-xs text-stone-400">
          <span>Libérica</span>
          <span>Excelsa</span>
        </div>
      </div>
    </div>
  ),
  Geographic: (
    <div className="mb-6">
      {/* Geographic Data View */}
      <div className="bg-[var(--parchment)] rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">&#128202;</span>
          <span className="font-main font-bold text-[var(--espresso-black)] text-sm">Geographic Data View</span>
        </div>
        <div className="text-xs font-accent text-[var(--espresso-black)] mb-2">mean distribution across different farming regions</div>
        <div className="flex items-center justify-center h-64">
          <span className="text-stone-400">[Map Chart]</span>
        </div>
        <div className="text-xs text-stone-400 mt-2">Showing data from 3 farms across the region</div>
      </div>
    </div>
  ),
  Comparison: (
    <div className="mb-6">
      {/* Feature Averages by Farm */}
      <div className="bg-[var(--parchment)] rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">&#128202;</span>
          <span className="font-main font-bold text-[var(--espresso-black)] text-sm">Feature Averages by Farm</span>
        </div>
        <div className="text-xs font-accent text-[var(--espresso-black)] mb-2">Comparative analysis across different farming regions.</div>
        <div className="flex items-center justify-center h-64">
          <span className="text-stone-400">[Bar Chart]</span>
        </div>
        <div className="flex gap-2 mt-2 text-xs text-stone-400">
          <span>length</span>
          <span>width</span>
          <span>area</span>
        </div>
      </div>
    </div>
  ),
};

const AnalysisCharts: React.FC<AnalysisChartsProps> = ({ activeTab }) => {
  return <>{chartsByTab[activeTab] || null}</>;
};

export default AnalysisCharts;
