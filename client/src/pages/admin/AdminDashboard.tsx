import React, { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import CardComponent from '@/components/CardComponent';
import ScatterRatioRoundnessChart from '@/components/admin/ScatterRatioRoundnessChart';
import SystemStatusComponent from '@/components/admin/SystemStatusComponent';
import UploadStatisticsChart from '@/components/admin/UploadStatisticsChart';
import CorrelationMatrixChart from '@/components/admin/CorrelationMatrixChart';
import BeanAnalyticsChart from '@/components/admin/BeanAnalyticsChart';
import { PieChartComponent, LinearProgressBar, HorizontalBarChartComponent } from '@/components/ChartComponent';
import { useCachedAdminService } from '@/hooks/useCachedServices';
import { useCache } from '@/contexts/CacheContext';
import type {
  AdminStats,
  SystemStatus
} from '@/interfaces/global';
import DashboardHeader from '@/components/DashboardHeader';
import { BarChart, DatabaseIcon, HardDrive as StorageIcon } from 'lucide-react';
import ShapeSizeDistribution from '@/components/admin/ShapeSizeDistribution';
import BoxPlotChart from '@/components/admin/BoxPlotChart';

export default function AdminDashboard() {
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [boxPlotData, setBoxPlotData] = useState<Array<{ 
    group: string; 
    farms: string[];
    data: Array<{ farm: string; value: number }>;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cachedAdminService = useCachedAdminService();
  const cache = useCache();

  const [sizeDb, setSizeDb] = useState<{
    bucket: number;
    database: number;
  }>({ bucket: 1000, database: 500 });

  // Update sizeDb based on payment plan
  const updateSizeDbFromPlan = (planType: 'free' | 'pro') => {
    if (planType === 'pro') {
      setSizeDb({ bucket: 100000, database: 8000 });
    } else {
      setSizeDb({ bucket: 1000, database: 500 });
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all dashboard data in parallel with caching
        const [stats, status] = await Promise.all([
          cachedAdminService.getAdminStats(),
          cachedAdminService.getSystemStatus()
        ]);

        setAdminStats(stats);
        setSystemStatus(status);

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

        // Update sizeDb based on payment plan
        if (status?.paymentPlan?.plan_type) {
          updateSizeDbFromPlan(status.paymentPlan.plan_type);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Force refresh function that clears cache
  const handleRefresh = async () => {
    cache.invalidatePattern('admin-stats:');
    cache.invalidatePattern('user-activity:');
    cache.invalidatePattern('bean-submissions:');
    cache.invalidatePattern('user-logs:');

    setLoading(true);
    try {
      const [stats, status] = await Promise.all([
        cachedAdminService.getAdminStats(),
        cachedAdminService.getSystemStatus()
      ]);

      setAdminStats(stats);
      setSystemStatus(status);

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

      // Update sizeDb based on payment plan
      if (status?.paymentPlan?.plan_type) {
        updateSizeDbFromPlan(status.paymentPlan.plan_type);
      }
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      setError('Failed to refresh dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle payment plan update
  const handlePlanUpdate = async () => {
    try {
      const status = await cachedAdminService.getSystemStatus();
      setSystemStatus(status);
      if (status?.paymentPlan?.plan_type) {
        updateSizeDbFromPlan(status.paymentPlan.plan_type);
      }
      console.log('System status after plan update:', status);
      console.log('Payment plan after update:', status?.paymentPlan);
    } catch (err) {
      console.error('Error refreshing system status:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-lvh bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--arabica-brown)] mx-auto mb-4"></div>
          <p className="text-gray-600 font-accent">Loading dashboard...</p>
          <div className="mt-2 text-xs text-gray-500">
            Cache stats: {cache.getStats().hitRate.toFixed(1)}% hit rate
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-lvh bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 font-accent mb-4">{error}</p>
          <div className="space-x-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-[var(--arabica-brown)] text-[var(--parchment)] rounded-lg font-accent hover:bg-opacity-90 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg font-accent hover:bg-opacity-90 transition-colors"
            >
              Hard Reload
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!adminStats || !systemStatus) {
    return (
      <div className="min-h-lvh bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <p className="text-gray-600 font-accent">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full max-w-7xl bg-white p-6 mx-auto">
      <div>
        <DashboardHeader title="Admin Dashboard" subtitle='' />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            label="Total Users"
            value={adminStats.users}
            subtext="Registered users across all roles"
          />
          <StatCard
            label="Total Uploads"
            value={adminStats.uploads}
            subtext="Bean samples uploaded to date"
          />
          <StatCard
            label="Validated Images"
            value={adminStats.validated}
            subtext="Images reviewed by researchers"
          />
          <StatCard
            label="Pending Validations"
            value={adminStats.pending}
            subtext="Samples awaiting researcher review"
          />

        </div>

        {/* System & Infrastructure Section */}
        <section className="space-y-6 sm:space-y-8 mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <DatabaseIcon className="h-6 w-6 text-[var(--arabica-brown)]" />
            <div>
              <h2 className="text-xl font-semibold text-[#3c2715]">System &amp; Infrastructure</h2>
              <p className="text-sm text-gray-500">Monitor platform health, storage quotas, and table distribution.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <div className="w-full min-h-[400px]">
              <CardComponent
                item={{
                  title: "System Status",
                  subtitle: "Database uptime, Supabase status, and payment plan",
                  content: (
                    <SystemStatusComponent
                      data={systemStatus}
                      onPlanUpdate={handlePlanUpdate}
                    />
                  ),
                  description: "Monitor system health and manage subscription"
                }}
              />
            </div>

            <div className="w-full min-h-[400px] space-y-4">
              <div className="min-h-[200px]">
                <CardComponent
                  item={{
                    side: (<DatabaseIcon className="text-[var(--arabica-brown)]" />),
                    title: "Database Storage",
                    subtitle: `${sizeDb.database} MB limit`,
                    content: (
                      <LinearProgressBar
                        data={{
                          total_size: sizeDb.database,
                          size: adminStats.db_size.total
                        }}
                      />
                    ),
                    description: "Database storage usage"
                  }}
                />
              </div>

              <div className="min-h-[200px]">
                <CardComponent
                  item={{
                    side: (<StorageIcon className="text-[var(--arabica-brown)]" />),
                    title: "Image Bucket Storage",
                    subtitle: `${sizeDb.bucket} MB limit`,
                    content: (
                      <LinearProgressBar
                        data={{
                          total_size: sizeDb.bucket,
                          size: adminStats.img_bucket[0].total_size
                        }}
                      />
                    ),
                    description: "Image storage usage"
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            <div className="min-h-[400px] xl:col-span-1">
              <CardComponent
                item={{
                  title: "Database Tables Distribution",
                  subtitle: "Storage usage by table",
                  content: (
                    <PieChartComponent
                      data={adminStats.db_size.tables.filter(table => {
                        const publicTables = [
                          'spatial_ref_sys',
                          'activity_logs',
                          'extracted_features',
                          'annotations',
                          'roles',
                          'user_roles',
                          'users',
                          'predictions',
                          'user_images',
                          'role_permissions',
                          'notifications',
                          'locations',
                          'bean_detections',
                          'images',
                          'permissions'
                        ];
                        return publicTables.includes(table.table_name);
                      }).map(table => {
                        const sizeStr = table.total_size;
                        let sizeInMB = 0;

                        if (sizeStr.includes('bytes')) {
                          sizeInMB = parseFloat(sizeStr.replace(/[^\d.]/g, '')) / (1024 * 1024);
                        } else if (sizeStr.includes('kB')) {
                          sizeInMB = parseFloat(sizeStr.replace(/[^\d.]/g, '')) / 1024;
                        } else if (sizeStr.includes('MB')) {
                          sizeInMB = parseFloat(sizeStr.replace(/[^\d.]/g, ''));
                        } else if (sizeStr.includes('GB')) {
                          sizeInMB = parseFloat(sizeStr.replace(/[^\d.]/g, '')) * 1024;
                        }

                        return {
                          name: table.table_name,
                          uv: sizeInMB
                        };
                      })}
                    />
                  ),
                  description: "Overview of database storage distribution by table"
                }}
              />
            </div>
            <div className="min-h-[400px] xl:col-span-2">
              <CardComponent
                item={{
                  title: " ",
                  subtitle: " ",
                  content: (
                    <HorizontalBarChartComponent
                      data={adminStats.db_size.tables.filter(table => {
                        const publicTables = [
                          'spatial_ref_sys',
                          'activity_logs',
                          'extracted_features',
                          'annotations',
                          'roles',
                          'user_roles',
                          'users',
                          'predictions',
                          'user_images',
                          'role_permissions',
                          'notifications',
                          'locations',
                          'bean_detections',
                          'images',
                          'permissions'
                        ];
                        return publicTables.includes(table.table_name);
                      }).map(table => ({
                        name: table.table_name,
                        uv: table.estimated_rows
                      }))}
                    />
                  ),
                  description: " "
                }}
              />
            </div>
          </div>
        </section>

        {/* Dataset Verification Section */}
        <section className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <BarChart className="h-6 w-6 text-[var(--arabica-brown)]" />
            <div>
              <h2 className="text-xl font-semibold text-[#3c2715]">Dataset Verification</h2>
              <p className="text-sm text-gray-500">Validate prediction quality, audit uploads, and surface anomalies for review.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="min-h-[520px]">
              <BeanAnalyticsChart
                totalPredictions={adminStats.total_predictions}
                avgConfidence={adminStats.avg_confidence}
                minConfidence={adminStats.min_confidence}
                maxConfidence={adminStats.max_confidence}
                featureStats={adminStats.feature_stats}
                boxplotFeatures={adminStats.boxplot_features}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <div className="min-h-[460px]">
                <CardComponent
                  item={{
                    title: "Upload Statistics",
                    subtitle: "Farm activity, top contributors, and bean type mix",
                    content: (
                      <div className="w-full">
                        <UploadStatisticsChart
                          farmData={adminStats.farms}
                          topUploaderData={adminStats.top_uploaders}
                          beanTypeData={adminStats.bean_types}
                        />
                      </div>
                    ),
                    description: "Monitor upload distribution across farms and roles"
                  }}
                />
              </div>

              <div className="min-h-[460px]">
                {loading ? (
                  <div className="bg-[var(--parchment)] rounded-lg shadow p-6 h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--arabica-brown)] mx-auto mb-4"></div>
                      <p className="text-gray-600 font-accent">Loading outlier analysis...</p>
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
                  <div className="bg-[var(--parchment)] rounded-lg shadow p-6 h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <p>No feature data available for outlier analysis</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Shape & Pattern Analysis Section */}
        <section className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <BarChart className="h-6 w-6 text-[var(--arabica-brown)]" />
            <div>
              <h2 className="text-xl font-semibold text-[#3c2715]">Shape &amp; Pattern Analysis</h2>
              <p className="text-sm text-gray-500">Track geometric trends, feature relationships, and distribution shifts by farm.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <div className="min-h-[420px]">
              <CardComponent
                item={{
                  title: "Feature Correlation Matrix",
                  subtitle: "Correlation analysis of bean features",
                  content: <CorrelationMatrixChart data={adminStats.corr_feats} />,
                  description: "Heat map showing correlations between different bean features"
                }}
              />
            </div>

            <div className="min-h-[420px]">
              {loading ? (
                <div className="bg-[var(--parchment)] rounded-lg shadow p-6 h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--arabica-brown)] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-accent">Loading shape analysis...</p>
                  </div>
                </div>
              ) : adminStats && adminStats.shape_size_distribution && Object.keys(adminStats.shape_size_distribution).length > 0 ? (
                <CardComponent
                  item={{
                    title: "Bean Shape and Size Distribution",
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
                <div className="bg-[var(--parchment)] rounded-lg shadow p-6 h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p>No shape-size distribution data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="min-h-[420px]">
            <CardComponent
              item={{
                title: "Scatter Ratio and Roundness",
                subtitle: "Analysis of bean shape characteristics",
                content: <ScatterRatioRoundnessChart data={adminStats.scatter_ratio_roundness} data2={adminStats.hist_aspect} data3={adminStats.hist_roundness} />,
                description: "Explore the relationship between scatter ratio and roundness"
              }}
            />
          </div>
        </section>

      </div>
    </div>
  );
}