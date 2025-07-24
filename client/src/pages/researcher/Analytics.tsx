
import React, { useState } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import TabComponent from '../../components/TabComponent';
import AnalysisCharts from './sections/AnalysisCharts';


const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Morphological');

  return (
    <div className="h-full bg-[var(--mocha-beige)] pt-8 pb-4 px-2 md:px-8 overflow-x-hidden">
      {/* Header */}
      <DashboardHeader
        title="Bean Visualization & Analysis"
        subtitle="Comprehensive morphological analysis and insights for Liberica beans"
        actions={
          <div className="flex gap-2">
            <button className="border border-[var(--parchment)] bg-[var(--espresso-black)] text-[var(--parchment)] px-3 py-1 rounded font-main text-xs shadow">All Time</button>
            <button className="border border-[var(--parchment)] bg-[var(--espresso-black)] text-[var(--parchment)] px-3 py-1 rounded font-main text-xs shadow">All Farms</button>
            <button className="border border-[var(--parchment)] bg-[var(--espresso-black)] text-[var(--parchment)] px-3 py-1 rounded font-main text-xs shadow">All Types</button>
          </div>
        }
      />

      {/* Tabs Component */}
      <TabComponent activeTab={activeTab} onTabChange={setActiveTab} tabs={['Morphological', 'Distributions', 'Geographic', 'Comparison']}/>

      {/* Chart Section */}
      <AnalysisCharts activeTab={activeTab} />

      {/* Footer  */}
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
    </div>
  );
};

export default Analytics;