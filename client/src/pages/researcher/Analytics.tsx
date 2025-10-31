
import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import CardComponent from '@/components/CardComponent';
import CorrelationMatrixChart from '@/components/admin/CorrelationMatrixChart';
import AdminService from '@/services/adminService';
import type { AdminStats } from '@/interfaces/global';
import BoxPlotChart from '@/components/admin/BoxPlotChart';
import ShapeSizeDistribution from '@/components/admin/ShapeSizeDistribution';


const Analytics: React.FC = () => {
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [boxPlotData, setBoxPlotData] = useState<Array<{ 
    group: string; 
    farms: string[];
    data: Array<{ farm: string; value: number }>;
  }>>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const stats = await AdminService.getAdminStats();
        setAdminStats(stats);
        
        // Prepare boxplot data from boxplot_features
        if (stats.boxplot_features) {
          const features = Object.keys(stats.boxplot_features);
          const boxData = features.map(featureName => {
            const farms = stats.boxplot_features[featureName];
            const farmNames = Object.keys(farms);
            
            // Flatten all farm values into single array with farm labels
            const allValues: Array<{ farm: string; value: number }> = [];
            farmNames.forEach(farmName => {
              farms[farmName].forEach(value => {
                allValues.push({ farm: farmName, value });
              });
            });
            
            return {
              group: featureName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              farms: farmNames,
              data: allValues
            };
          });
          setBoxPlotData(boxData);
        }
      } catch (err) {
        console.error('Error fetching analytics data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="h-full bg-white pt-8 pb-4 px-2 md:px-8 overflow-x-hidden">
      {/* Header */}
      <DashboardHeader
        title="Bean Visualization & Analysis"
        subtitle="Comprehensive morphological analysis and insights for Liberica beans"
        // actions={
        //   <div className="flex gap-2">
        //     <button className="border border-[var(--parchment)] bg-[var(--espresso-black)] text-[var(--parchment)] px-3 py-1 rounded font-main text-xs shadow">All Time</button>
        //     <button className="border border-[var(--parchment)] bg-[var(--espresso-black)] text-[var(--parchment)] px-3 py-1 rounded font-main text-xs shadow">All Farms</button>
        //     <button className="border border-[var(--parchment)] bg-[var(--espresso-black)] text-[var(--parchment)] px-3 py-1 rounded font-main text-xs shadow">All Types</button>
        //   </div>
        // }
      />

      {/* Tabs Component */}
      {/* <TabComponent activeTab={activeTab} onTabChange={setActiveTab} tabs={['Morphological', 'Distributions', 'Geographic', 'Comparison']}/> */}

      {/* Chart Section */}
      {/* <AnalysisCharts activeTab={activeTab} /> */}

      {/* Outlier Detection - Boxplots Section */}
      <div className="mt-6 mb-6">
        {loading ? (
          <div className="bg-[var(--parchment)] rounded-lg shadow p-6">
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--arabica-brown)] mx-auto mb-4"></div>
                <p className="text-gray-600 font-accent">Loading outlier analysis...</p>
              </div>
            </div>
          </div>
        ) : boxPlotData && boxPlotData.length > 0 ? (
          <CardComponent
            item={{
              title: "Outlier Detection - Bean Feature Analysis",
              subtitle: "Boxplot distribution showing quartiles, whiskers, and outliers",
              content: (
                <div className="w-full">
                  <BoxPlotChart 
                    data={boxPlotData}
                    yAxisLabel="Feature Value"
                  />
                </div>
              )
            }}
          />
        ) : (
          <div className="bg-[var(--parchment)] rounded-lg shadow p-6">
            <div className="flex items-center justify-center h-[400px] text-gray-500">
              <div className="text-center">
                <p>No feature data available for outlier analysis</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shape-Size Distribution Section */}
      <div className="mt-6 mb-6">
        {loading ? (
          <div className="bg-[var(--parchment)] rounded-lg shadow p-6">
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--arabica-brown)] mx-auto mb-4"></div>
                <p className="text-gray-600 font-accent">Loading shape analysis...</p>
              </div>
            </div>
          </div>
        ) : adminStats && adminStats.shape_size_distribution && Object.keys(adminStats.shape_size_distribution).length > 0 ? (
          <CardComponent
            item={{
              title: "Bean Shape & Size Distribution",
              subtitle: "Comparison of round vs teardrop beans across size categories",
              content: (
                <div className="w-full">
                  <ShapeSizeDistribution 
                    data={adminStats.shape_size_distribution}
                    farmNames={adminStats.shape_size_farm_names || []}
                    thresholds={adminStats.size_thresholds}
                  />
                </div>
              )
            }}
          />
        ) : (
          <div className="bg-[var(--parchment)] rounded-lg shadow p-6">
            <div className="flex items-center justify-center h-[400px] text-gray-500">
              <div className="text-center">
                <p>No shape-size distribution data available</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Correlation Matrix Section */}
      <div className="mt-6 mb-6">
        {loading ? (
          <div className="bg-[var(--parchment)] rounded-lg shadow p-6">
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--arabica-brown)] mx-auto mb-4"></div>
                <p className="text-gray-600 font-accent">Loading correlation matrix...</p>
              </div>
            </div>
          </div>
        ) : adminStats && adminStats.corr_feats && adminStats.corr_feats.length > 0 ? (
          <CardComponent
            item={{
              title: "Feature Correlation Matrix",
              subtitle: "Correlation analysis of bean features",
              description: "Heat map showing correlations between different bean features (-1 to 1 scale)",
              content: (
                <div className="w-full h-[500px]">
                  <CorrelationMatrixChart data={adminStats.corr_feats} />
                </div>
              )
            }}
          />
        ) : (
          <div className="bg-[var(--parchment)] rounded-lg shadow p-6">
            <div className="flex items-center justify-center h-[400px] text-gray-500">
              <div className="text-center">
                <p>No correlation data available</p>
              </div>
            </div>
          </div>
        )}
      </div>

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