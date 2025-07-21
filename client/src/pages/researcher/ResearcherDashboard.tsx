import React from 'react';

// Placeholder chart components
const PieChart = () => (
  <div className="flex items-center justify-center h-40">
    <span className="text-stone-400">[Pie Chart]</span>
  </div>
);
const LineChart = () => (
  <div className="flex items-center justify-center h-40">
    <span className="text-stone-400">[Line Chart]</span>
  </div>
);
const BarChart = () => (
  <div className="flex items-center justify-center h-40">
    <span className="text-stone-400">[Bar Chart]</span>
  </div>
);
const ScatterChart = () => (
  <div className="flex items-center justify-center h-40">
    <span className="text-stone-400">[Scatter Chart]</span>
  </div>
);
const CorrelationGrid = () => (
  <div className="flex items-center justify-center h-40">
    <span className="text-stone-400">[Correlation Grid]</span>
  </div>
);

const ResearcherDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--mocha-beige)] pt-8 pb-4 px-2 md:px-8 overflow-x-hidden">
      {/* Header */}
      <div className="bg-[var(--espresso-black)] rounded-lg px-6 py-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between shadow text-[var(--parchment)]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-main">Researcher Dashboard</h1>
          <p className="text-xs md:text-sm text-[var(--mocha-beige)] font-accent">Morphological analysis and data insights</p>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <button className="bg-[var(--arabica-brown)] text-[var(--parchment)] px-3 py-1 rounded font-main text-xs shadow">Data Range</button>
          <button className="bg-[var(--arabica-brown)] text-[var(--parchment)] px-3 py-1 rounded font-main text-xs shadow">Filter by Farm</button>
          <button className="bg-[var(--arabica-brown)] text-[var(--parchment)] px-3 py-1 rounded font-main text-xs shadow">Bean Type</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--arabica-brown)] rounded-lg p-4 text-center shadow text-[var(--parchment)]">
          <div className="text-xs font-accent mb-1">Total Samples</div>
          <div className="text-2xl font-bold font-main">2847</div>
          <div className="text-xs font-accent">from last month</div>
        </div>
        <div className="bg-[var(--arabica-brown)] rounded-lg p-4 text-center shadow text-[var(--parchment)]">
          <div className="text-xs font-accent mb-1">Verified Samples</div>
          <div className="text-2xl font-bold font-main">2103</div>
          <div className="text-xs font-accent">from last month</div>
        </div>
        <div className="bg-[var(--arabica-brown)] rounded-lg p-4 text-center shadow text-[var(--parchment)]">
          <div className="text-xs font-accent mb-1">Average Bean Size</div>
          <div className="text-2xl font-bold font-main">17.8 mm</div>
          <div className="text-xs font-accent">from last month</div>
        </div>
        <div className="bg-[var(--arabica-brown)] rounded-lg p-4 text-center shadow text-[var(--parchment)]">
          <div className="text-xs font-accent mb-1">Classification Accuracy</div>
          <div className="text-2xl font-bold font-main">92.4%</div>
          <div className="text-xs font-accent">from last month</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="font-accent text-xs text-stone-500 mb-2">Bean Type Distribution</div>
          <PieChart />
          <div className="flex justify-center gap-2 mt-2 text-xs text-stone-400">
            <span>Libérica 65%</span>
            <span>Excelsa 25%</span>
            <span>Unclassified 10%</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="font-accent text-xs text-stone-500 mb-2">Monthly Morphological Trends</div>
          <LineChart />
          <div className="flex justify-center gap-2 mt-2 text-xs text-stone-400">
            <span>Area</span>
            <span>Perimeter</span>
            <span>Export Data</span>
          </div>
        </div>
      </div>

      {/* Feature Distributions by Variety */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="font-accent text-xs text-stone-500 mb-2">Box Plot: Size Distribution</div>
          <BarChart />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="font-accent text-xs text-stone-500 mb-2">2D Scatter: Major vs Minor Axis</div>
          <ScatterChart />
        </div>
      </div>

      {/* Feature Averages and Correlation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="font-accent text-xs text-stone-500 mb-2">Feature Averages by Farm</div>
          <BarChart />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="font-accent text-xs text-stone-500 mb-2">Feature Correlation</div>
          <CorrelationGrid />
        </div>
      </div>

      {/* Feature Averages by Farm (Bubble) */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="font-accent text-xs text-stone-500 mb-2">Feature Averages by Farm</div>
        <ScatterChart />
        <div className="flex justify-center gap-2 mt-2 text-xs text-stone-400">
          <span>High Volume</span>
          <span>Medium Volume</span>
          <span>Low Volume</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap gap-2 justify-center ">
        <button className="bg-[var(--arabica-brown)] text-[var(--parchment)] px-4 py-2 rounded font-main text-xs shadow">Upload Bean</button>
        <button className="bg-[var(--arabica-brown)] text-[var(--parchment)] px-4 py-2 rounded font-main text-xs shadow">Validation Queue</button>
        <button className="bg-[var(--arabica-brown)] text-[var(--parchment)] px-4 py-2 rounded font-main text-xs shadow">Analytics Hub</button>
        <button className="bg-[var(--arabica-brown)] text-[var(--parchment)] px-4 py-2 rounded font-main text-xs shadow">Export Report</button>
      </div>
    </div>
  );
};

export default ResearcherDashboard;
