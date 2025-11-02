import React, { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import CardComponent from '@/components/CardComponent';
import UserActivityChart from '@/components/admin/UserActivityChart';
import ScatterRatioRoundnessChart from '@/components/admin/ScatterRatioRoundnessChart';
import BeanSubmissionsChart from '@/components/admin/BeanSubmissionsChart';
import UserLogsComponent from '@/components/admin/UserLogsComponent';
import SystemStatusComponent from '@/components/admin/SystemStatusComponent';
import UploadStatisticsChart from '@/components/admin/UploadStatisticsChart';
import CorrelationMatrixChart from '@/components/admin/CorrelationMatrixChart';
import BeanAnalyticsChart from '@/components/admin/BeanAnalyticsChart';
import AdminService from '@/services/adminService';
import type { 
  AdminStats, 
  UserActivity, 
  BeanSubmission, 
  UserLog, 
  SystemStatus 
} from '@/interfaces/global';

export default function AdminDashboard() {
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [beanSubmissions, setBeanSubmissions] = useState<BeanSubmission[]>([]);
  const [userLogs, setUserLogs] = useState<UserLog[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all dashboard data in parallel
        const [stats, activity, submissions, logs, status] = await Promise.all([
          AdminService.getAdminStats(),
          AdminService.getUserActivity(),
          AdminService.getBeanSubmissions(),
          AdminService.getUserLogs(),
          AdminService.getSystemStatus()
        ]);

        setAdminStats(stats);
        setUserActivity(activity);
        setBeanSubmissions(submissions);
        setUserLogs(logs);
        setSystemStatus(status);
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
      <div className="min-h-lvh bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--arabica-brown)] mx-auto mb-4"></div>
          <p className="text-gray-600 font-accent">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-lvh bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
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

  if (!adminStats || !systemStatus) {
    return (
      <div className="min-h-lvh bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <p className="text-gray-600 font-accent">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-lvh bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-main font-bold text-[var(--espresso-black)] mb-2">
            Admin Dashboard
          </h1>
         
        </div>
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

        {/* Bean Analytics Section */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="min-h-[500px]">
            <BeanAnalyticsChart 
              totalPredictions={adminStats.total_predictions}
              avgConfidence={adminStats.avg_confidence}
              minConfidence={adminStats.min_confidence}
              maxConfidence={adminStats.max_confidence}
              featureStats={adminStats.feature_stats}
            />
          </div>
        </div>

        
        {/* Upload Statistics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="min-h-[400px]">
            <CardComponent
              item={{
                title: "Upload Statistics",
                subtitle: "Farm data, top uploaders, and bean type distribution",
                content: <UploadStatisticsChart 
                  farmData={adminStats.farms} 
                  topUploaderData={adminStats.top_uploaders} 
                  beanTypeData={adminStats.bean_types} 
                />,
                description: "Comprehensive upload analytics across farms and users"
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Scatter Ratio and Roundness */}
          <div className="min-h-[400px]">
            <CardComponent
              item={{
                title: "Scatter Ratio and Roundness",
                subtitle: "Analysis of bean shape characteristics",
                content: <ScatterRatioRoundnessChart data={adminStats.scatter_ratio_roundness} data2={adminStats.hist_aspect} data3={adminStats.hist_roundness} />,
                description: "Explore the relationship between scatter ratio and roundness"
              }}
            />
          </div>
          
          {/* Correlation Matrix */}
          <div className="min-h-[400px]">
            <CardComponent
              item={{
                title: "Feature Correlation Matrix",
                subtitle: "Correlation analysis of bean features",
                content: <CorrelationMatrixChart data={adminStats.corr_feats} />,
                description: "Heat map showing correlations between different bean features"
              }}
            />
          </div>
        </div>
        


     
      </div>
    </div>
  );
}