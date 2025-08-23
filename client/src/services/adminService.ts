import type { 
  AdminStats, 
  UserActivity, 
  BeanSubmission, 
  UserLog, 
  SystemStatus 
} from '@/interfaces/global';

// Temporary data - replace with actual API calls
const tempAdminStats: AdminStats = {
  totalUsers: 1247,
  activeUsers: 892,
  totalUploads: 3456,
  pendingValidations: 23
};

const tempUserActivity: UserActivity[] = [
  { date: 'Jan', farmers: 45, researchers: 12, total: 57 },
  { date: 'Feb', farmers: 52, researchers: 15, total: 67 },
  { date: 'Mar', farmers: 48, researchers: 18, total: 66 },
  { date: 'Apr', farmers: 61, researchers: 22, total: 83 },
  { date: 'May', farmers: 55, researchers: 25, total: 80 },
  { date: 'Jun', farmers: 67, researchers: 28, total: 95 },
  { date: 'Jul', farmers: 73, researchers: 30, total: 103 }
];

const tempBeanSubmissions: BeanSubmission[] = [
  { id: '1', farmerName: 'John Smith', beanType: 'Arabica', submissionDate: '2024-01-15', status: 'approved', location: 'Kenya', quantity: 150, quality: 85 },
  { id: '2', farmerName: 'Maria Garcia', beanType: 'Robusta', submissionDate: '2024-01-16', status: 'pending', location: 'Brazil', quantity: 200, quality: 78 },
  { id: '3', farmerName: 'Ahmed Hassan', beanType: 'Arabica', submissionDate: '2024-01-17', status: 'approved', location: 'Ethiopia', quantity: 120, quality: 92 },
  { id: '4', farmerName: 'Sarah Johnson', beanType: 'Liberica', submissionDate: '2024-01-18', status: 'rejected', location: 'Philippines', quantity: 80, quality: 65 },
  { id: '5', farmerName: 'Carlos Rodriguez', beanType: 'Arabica', submissionDate: '2024-01-19', status: 'pending', location: 'Colombia', quantity: 180, quality: 88 },
  { id: '6', farmerName: 'Fatima Al-Zahra', beanType: 'Robusta', submissionDate: '2024-01-20', status: 'approved', location: 'Uganda', quantity: 160, quality: 82 }
];

const tempUserLogs: UserLog[] = [
  { id: '1', name: 'John Smith', role: 'Farmer', action: 'Uploaded bean sample', lastActive: '2 hours ago', email: 'john@example.com', status: 'active', joinDate: '2023-03-15', totalUploads: 45, totalValidations: 0 },
  { id: '2', name: 'Dr. Sarah Johnson', role: 'Researcher', action: 'Validated 3 samples', lastActive: '1 hour ago', email: 'sarah@research.com', status: 'active', joinDate: '2023-01-10', totalUploads: 0, totalValidations: 156 },
  { id: '3', name: 'Maria Garcia', role: 'Farmer', action: 'Updated profile', lastActive: '3 hours ago', email: 'maria@example.com', status: 'active', joinDate: '2023-06-22', totalUploads: 23, totalValidations: 0 },
  { id: '4', name: 'Ahmed Hassan', role: 'Farmer', action: 'Uploaded bean sample', lastActive: '5 hours ago', email: 'ahmed@example.com', status: 'active', joinDate: '2023-04-08', totalUploads: 67, totalValidations: 0 },
  { id: '5', name: 'Dr. Michael Chen', role: 'Researcher', action: 'Reviewed submissions', lastActive: '6 hours ago', email: 'michael@research.com', status: 'active', joinDate: '2023-02-14', totalUploads: 0, totalValidations: 89 },
  { id: '6', name: 'Lisa Thompson', role: 'Farmer', action: 'Logged in', lastActive: '1 day ago', email: 'lisa@example.com', status: 'inactive', joinDate: '2023-07-03', totalUploads: 12, totalValidations: 0 }
];

const tempSystemStatus: SystemStatus = {
  systemUptime: '99.8%',
  pendingPayments: 12500,
  duePayments: 8500,
  totalRevenue: '$45,230',
  activeSubscriptions: 892,
  serverStatus: 'online',
  lastBackup: '2024-01-20 02:00 AM',
  storageUsed: '2.4 TB',
  storageTotal: '5.0 TB'
};

// Admin Dashboard Service
export class AdminService {
  // Get admin dashboard statistics
  static async getAdminStats(): Promise<AdminStats> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/stats');
      // return await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return tempAdminStats;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }

  // Get user activity data
  static async getUserActivity(): Promise<UserActivity[]> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/user-activity');
      // return await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      return tempUserActivity;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  }

  // Get bean submissions data
  static async getBeanSubmissions(): Promise<BeanSubmission[]> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/bean-submissions');
      // return await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      return tempBeanSubmissions;
    } catch (error) {
      console.error('Error fetching bean submissions:', error);
      throw error;
    }
  }

  // Get user logs data
  static async getUserLogs(): Promise<UserLog[]> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/user-logs');
      // return await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      return tempUserLogs;
    } catch (error) {
      console.error('Error fetching user logs:', error);
      throw error;
    }
  }

  // Get system status data
  static async getSystemStatus(): Promise<SystemStatus> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/system-status');
      // return await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      return tempSystemStatus;
    } catch (error) {
      console.error('Error fetching system status:', error);
      throw error;
    }
  }

  // Get user details by ID
  static async getUserDetails(userId: string): Promise<UserLog | null> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/users/${userId}`);
      // return await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      return tempUserLogs.find(user => user.id === userId) || null;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  }

  // Update system status (for admin actions)
  static async updateSystemStatus(action: string): Promise<boolean> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/system/update', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ action })
      // });
      // return response.ok;
      
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log(`System action performed: ${action}`);
      return true;
    } catch (error) {
      console.error('Error updating system status:', error);
      throw error;
    }
  }
}

export default AdminService;
