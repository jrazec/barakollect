import CardComponent from '@/components/CardComponent';
import DashboardHeader from '@/components/DashboardHeader';
import { BarChartComponent, PieChartComponent, CorrelationGrid, ScatterChartComponent, LineChartComponent } from '@/components/ChartComponent';
import StatCard from '@/components/StatCard';
import type { CardAttributes, Stat } from '@/interfaces/global';
import React from 'react';


const ResearcherDashboard: React.FC = () => {
  const chartCards: CardAttributes[] = [
    {
      title: "Size Distribution Analysis",
      subtitle: "Box Plot: Size Distribution",
      description: "",
      content: <BarChartComponent />,
    },
    {
      title: "Bean Distribution Analysis",
      subtitle: "Bean Type Distribution",
      description: (<>
        <div className="flex justify-center gap-2 mt-2 text-xs text-stone-400">
          <span>Libérica 65%</span>
          <span>Excelsa 25%</span>
          <span>Unclassified 10%</span>
        </div>
      </>),
      content: <PieChartComponent />,
    },
    {
      title: "Morphological Trends",
      subtitle: "Size Distribution Analysis",
      description: (<>
        <div className="flex justify-center gap-2 mt-2 text-xs text-stone-400">
          <span>Area</span>
          <span>Perimeter</span>
          <span>Export Data</span>
        </div>
      </>),
      content: <LineChartComponent />,
    },

    // Mid
    {
      title: "Size Distribution",
      subtitle: "Box Plot:Size Distribution",
      content: <BarChartComponent />,
    },
    {
      title: "Axis Correlation",
      subtitle: "2D Scatter: Major vs Minor Axis",
      content: <ScatterChartComponent />,
    },

    // second to the last
    {
      title: "Farm Feature Analysis",
      subtitle: "Feature Averages by Farm",
      content: < BarChartComponent />,
    },
    {
      title: "Feature Correlation Matrix",
      subtitle: "Feature Correlation",
      content: <CorrelationGrid />,
    },

    // LAST
    {
      title: "Farm Volume Analysis",
      subtitle: "Feature Averages by Farm",
      description: (<>
        <div className="flex justify-center gap-2 mt-2 text-xs text-stone-400">
          <span>High Volume</span>
          <span>Medium Volume</span>
          <span>Low Volume</span>
        </div>
      </>),
      content: <ScatterChartComponent />,
    },


  ]
  const statCards: Stat[] = [
    {
      label: "Total Samples",
      value: "2847",
      subtext: "from last month"
    },
    {
      label: "Verified Samples",
      value: "2103",
      subtext: "from last month"
    },
    {
      label: "Average Bean Size",
      value: "17.8 mm",
      subtext: "from last month"
    },
    {
      label: "Classification Accuracy",
      value: "92.4%",
      subtext: "from last month"
    }
  ];

  return (

    <div className="min-h-screen bg-[var(--mocha-beige)] pt-8 pb-4 px-2 md:px-8 overflow-x-hidden">
      {/* Header */}
      <DashboardHeader
        title='Researcher Dashboard'
        subtitle='Morphological analysis and data insights'
        actions={
          <>
            <button className="bg-[var(--arabica-brown)] text-[var(--parchment)] px-3 py-1 rounded font-main text-xs shadow">Data Range</button>
            <button className="bg-[var(--arabica-brown)] text-[var(--parchment)] px-3 py-1 rounded font-main text-xs shadow">Filter by Farm</button>
            <button className="bg-[var(--arabica-brown)] text-[var(--parchment)] px-3 py-1 rounded font-main text-xs shadow">Bean Type</button>
          </>

        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.length > 0 &&
          statCards.map(card => {
            return <StatCard label={card.label} value={card.value} subtext={card.subtext} />;
          })
        }
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {chartCards && chartCards.map((card) => {
          return <CardComponent item={card} />
        })
        }
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
