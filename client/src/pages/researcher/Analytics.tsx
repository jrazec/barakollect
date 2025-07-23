
import React, { useState } from 'react';
import DashboardHeader from './DashboardHeader';
import TabComponent from '../../components/TabComponent';
import AnalysisFooter from './AnalysisFooter';
import AnalysisCharts from './AnalysisCharts';


const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Morphological');

  return (
    <div className="min-h-screen bg-[var(--mocha-beige)] pt-8 pb-4 px-2 md:px-8 overflow-x-hidden">
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

      {/* Footer Component */}
      <AnalysisFooter />
    </div>
  );
};

export default Analytics;