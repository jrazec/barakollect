import React, { useState, useEffect } from 'react';
import CardComponent from '@/components/CardComponent';
import DashboardHeader from '@/components/DashboardHeader';
import StatCard from '@/components/StatCard';
import ScatterRatioRoundnessChart from '@/components/admin/ScatterRatioRoundnessChart';
import BeanAnalyticsChart from '@/components/admin/BeanAnalyticsChart';
import AdminService from '@/services/adminService';
import type { AdminStats } from '@/interfaces/global';

const ResearcherDashboard: React.FC = () => {
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch admin stats for analytics data
        const stats = await AdminService.getAdminStats();
        setAdminStats(stats);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--arabica-brown)] mx-auto mb-4"></div>
          <p className="text-gray-600 font-accent">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 font-accent mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[var(--arabica-brown)] text-[var(--parchment)] rounded-lg font-accent hover:bg-opacity-90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!adminStats) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6 flex items-center justify-center">
        <p className="text-gray-600 font-accent">No data available</p>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Uploads",
      value: adminStats.uploads.toString(),
      subtext: "Bean samples uploaded"
    },
    {
      label: "Validated Samples",
      value: adminStats.validated.toString(),
      subtext: "Reviewed by researchers"
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-8 pb-4 px-2 md:px-8 overflow-x-hidden">
      {/* Header */}
      <DashboardHeader
        title='Researcher Dashboard'
        subtitle='Morphological analysis and data insights'
        
            />

        {/* Stat Cards */}
        <div className="w-full flex flex-row gap-4 mb-6">
          {statCards.map((card, index) => (
            <div className="flex-1 min-w-0" key={index}>
              <StatCard 
                label={card.label} 
                value={card.value} 
                subtext={card.subtext} 
              />
            </div>
          ))}
        </div>

      {/* Bean Analytics Section */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="min-h-[500px]">
          <CardComponent
            item={{
              title: "Bean Analytics & Feature Statistics",
              subtitle: "Comprehensive feature analysis across farms",
              description: "View mean, median, and mode statistics for each bean feature",
              content: <BeanAnalyticsChart 
                totalPredictions={adminStats.total_predictions}
                avgConfidence={adminStats.avg_confidence}
                minConfidence={adminStats.min_confidence}
                maxConfidence={adminStats.max_confidence}
                featureStats={adminStats.feature_stats}
                boxplotFeatures={adminStats.boxplot_features}
              />
            }}
          />
        </div>
      </div>

      {/* Scatter Ratio Section */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Scatter Ratio and Roundness */}
        <div className="min-h-[400px]">
          <CardComponent
            item={{
              title: "Bean Shape Analysis",
              subtitle: "Scatter ratio, roundness, and distribution histograms",
              description: "Explore the relationship between aspect ratio and roundness with detailed distributions",
              content: <ScatterRatioRoundnessChart 
                data={adminStats.scatter_ratio_roundness} 
                data2={adminStats.hist_aspect} 
                data3={adminStats.hist_roundness} 
              />
            }}
          />
        </div>
      </div>

      {/* Footer Actions */}
      {/* <div className="flex flex-wrap gap-2 justify-center">
        <button className="bg-[var(--arabica-brown)] text-[var(--parchment)] px-4 py-2 rounded font-main text-xs shadow hover:bg-opacity-90 transition-colors">
          Upload Bean
        </button>
        <button className="bg-[var(--arabica-brown)] text-[var(--parchment)] px-4 py-2 rounded font-main text-xs shadow hover:bg-opacity-90 transition-colors">
          Validation Queue
        </button>
        <button className="bg-[var(--arabica-brown)] text-[var(--parchment)] px-4 py-2 rounded font-main text-xs shadow hover:bg-opacity-90 transition-colors">
          Analytics Hub
        </button>
        <button className="bg-[var(--arabica-brown)] text-[var(--parchment)] px-4 py-2 rounded font-main text-xs shadow hover:bg-opacity-90 transition-colors">
          Export Report
        </button>
      </div> */}
    </div>
  );
};

export default ResearcherDashboard;
