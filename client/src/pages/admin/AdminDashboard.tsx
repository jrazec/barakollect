import React, { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import CardComponent from '@/components/CardComponent';
import UserActivityChart from '@/components/admin/UserActivityChart';
import BeanSubmissionsChart from '@/components/admin/BeanSubmissionsChart';
import UserLogsComponent from '@/components/admin/UserLogsComponent';
import SystemStatusComponent from '@/components/admin/SystemStatusComponent';
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
          <p className="text-sm sm:text-base text-gray-600 font-accent">
            Monitor system performance, user activity, and manage platform operations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            label="Total Users"
            value={adminStats.totalUsers.toLocaleString()}
            subtext="Registered users across all roles"
          />
          <StatCard
            label="Active Users"
            value={adminStats.activeUsers.toLocaleString()}
            subtext="Users active in the last 30 days"
          />
          <StatCard
            label="Total Uploads"
            value={adminStats.totalUploads.toLocaleString()}
            subtext="Bean samples uploaded to date"
          />
          <StatCard
            label="Pending Validations"
            value={adminStats.pendingValidations.toString()}
            subtext="Samples awaiting researcher review"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* User Activity Chart */}
          <div className="min-h-[400px]">
            <CardComponent
              item={{
                title: "User Activity",
                subtitle: "Monthly activity trends by role",
                content: <UserActivityChart data={userActivity} />,
                description: "Filter by role to view specific user activity patterns"
              }}
            />
          </div>

          {/* Bean Submissions Chart */}
          <div className="min-h-[400px]">
            <CardComponent
              item={{
                title: "Bean Submissions",
                subtitle: "Submission statistics and status distribution",
                content: <BeanSubmissionsChart data={beanSubmissions} />,
                description: "View submissions by type and status with role filtering"
              }}
            />
          </div>
        </div>

        {/* User Logs and System Status */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* User Logs */}
          <div className="bg-[var(--parchment)] rounded-lg shadow p-4 sm:p-6 min-h-[500px]">
            <UserLogsComponent data={userLogs} />
          </div>

          {/* System Status */}
          <div className="bg-[var(--parchment)] rounded-lg shadow p-4 sm:p-6 min-h-[500px]">
            <div className="mb-4">
              <h3 className="text-lg font-main font-bold text-[var(--espresso-black)] mb-2">
                System Status
              </h3>
              <p className="text-sm font-accent text-gray-600">
                Monitor system health, payments, and storage
              </p>
            </div>
            <SystemStatusComponent data={systemStatus} />
          </div>
        </div>
      </div>
    </div>
  );
}