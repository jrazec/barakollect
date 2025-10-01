import type {
  AdminStats,
  UserActivity,
  BeanSubmission,
  UserLog,
  SystemStatus,
  UserManagementUser,
  ActivityLog,
  AdminPredictedImage,
  AdminImageFilters,
  PaginationData,
} from "@/interfaces/global";
import { supabase } from "@/lib/supabaseClient";

// Farm interface for admin GIS map
export interface Farm {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  hasLocation: boolean;
  userCount: number;
  imageCount: number;
  avgBeanSize: number;
  qualityRating: number;
  lastActivity: string;
  owner?: string;
  createdDate: string;
  totalUploads: number;
  validatedUploads: number;
  pendingValidations?: number;
}

export interface MorphologicalFeature {
  value: number;
  overall: number;
  status: 'above' | 'below' | 'neutral';
}

export interface FarmDetails extends Farm {
  users: Array<{
    id: string;
    name: string;
    role: string;
    uploads: number;
  }>;
  recentImages: Array<{
    id: string;
    url: string;
    uploadDate: string;
    beanCount: number;
  }>;
  aggregatedData: {
    area: MorphologicalFeature;
    perimeter: MorphologicalFeature;
    major_axis_length: MorphologicalFeature;
    minor_axis_length: MorphologicalFeature;
    extent: MorphologicalFeature;
    eccentricity: MorphologicalFeature;
    convex_area: MorphologicalFeature;
    solidity: MorphologicalFeature;
    mean_intensity: MorphologicalFeature;
    equivalent_diameter: MorphologicalFeature;
    aspect_ratio: MorphologicalFeature;
    circularity: MorphologicalFeature;
    commonBeanTypes: string[];
    qualityDistribution: Record<string, number>;
    monthlyUploads: Array<{ month: string; count: number }>;
  };
}

// Temporary data - replace with actual API calls
const tempAdminStats: AdminStats = {
  totalUsers: 1247,
  activeUsers: 892,
  totalUploads: 3456,
  pendingValidations: 23,
};

const tempUserActivity: UserActivity[] = [
  { date: "Jan", farmers: 45, researchers: 12, total: 57 },
  { date: "Feb", farmers: 52, researchers: 15, total: 67 },
  { date: "Mar", farmers: 48, researchers: 18, total: 66 },
  { date: "Apr", farmers: 61, researchers: 22, total: 83 },
  { date: "May", farmers: 55, researchers: 25, total: 80 },
  { date: "Jun", farmers: 67, researchers: 28, total: 95 },
  { date: "Jul", farmers: 73, researchers: 30, total: 103 },
];

const tempBeanSubmissions: BeanSubmission[] = [
  {
    id: "1",
    farmerName: "John Smith",
    beanType: "Arabica",
    submissionDate: "2024-01-15",
    status: "approved",
    location: "Kenya",
    quantity: 150,
    quality: 85,
  },
  {
    id: "2",
    farmerName: "Maria Garcia",
    beanType: "Robusta",
    submissionDate: "2024-01-16",
    status: "pending",
    location: "Brazil",
    quantity: 200,
    quality: 78,
  },
  {
    id: "3",
    farmerName: "Ahmed Hassan",
    beanType: "Arabica",
    submissionDate: "2024-01-17",
    status: "approved",
    location: "Ethiopia",
    quantity: 120,
    quality: 92,
  },
  {
    id: "4",
    farmerName: "Sarah Johnson",
    beanType: "Liberica",
    submissionDate: "2024-01-18",
    status: "rejected",
    location: "Philippines",
    quantity: 80,
    quality: 65,
  },
  {
    id: "5",
    farmerName: "Carlos Rodriguez",
    beanType: "Arabica",
    submissionDate: "2024-01-19",
    status: "pending",
    location: "Colombia",
    quantity: 180,
    quality: 88,
  },
  {
    id: "6",
    farmerName: "Fatima Al-Zahra",
    beanType: "Robusta",
    submissionDate: "2024-01-20",
    status: "approved",
    location: "Uganda",
    quantity: 160,
    quality: 82,
  },
];

const tempUserLogs: UserLog[] = [
  {
    id: "1",
    name: "John Smith",
    role: "Farmer",
    action: "Uploaded bean sample",
    lastActive: "2 hours ago",
    email: "john@example.com",
    status: "active",
    joinDate: "2023-03-15",
    totalUploads: 45,
    totalValidations: 0,
  },
  {
    id: "2",
    name: "Dr. Sarah Johnson",
    role: "Researcher",
    action: "Validated 3 samples",
    lastActive: "1 hour ago",
    email: "sarah@research.com",
    status: "active",
    joinDate: "2023-01-10",
    totalUploads: 0,
    totalValidations: 156,
  },
  {
    id: "3",
    name: "Maria Garcia",
    role: "Farmer",
    action: "Updated profile",
    lastActive: "3 hours ago",
    email: "maria@example.com",
    status: "active",
    joinDate: "2023-06-22",
    totalUploads: 23,
    totalValidations: 0,
  },
  {
    id: "4",
    name: "Ahmed Hassan",
    role: "Farmer",
    action: "Uploaded bean sample",
    lastActive: "5 hours ago",
    email: "ahmed@example.com",
    status: "active",
    joinDate: "2023-04-08",
    totalUploads: 67,
    totalValidations: 0,
  },
  {
    id: "5",
    name: "Dr. Michael Chen",
    role: "Researcher",
    action: "Reviewed submissions",
    lastActive: "6 hours ago",
    email: "michael@research.com",
    status: "active",
    joinDate: "2023-02-14",
    totalUploads: 0,
    totalValidations: 89,
  },
  {
    id: "6",
    name: "Lisa Thompson",
    role: "Farmer",
    action: "Logged in",
    lastActive: "1 day ago",
    email: "lisa@example.com",
    status: "inactive",
    joinDate: "2023-07-03",
    totalUploads: 12,
    totalValidations: 0,
  },
];

const tempSystemStatus: SystemStatus = {
  systemUptime: "99.8%",
  pendingPayments: 12500,
  duePayments: 8500,
  totalRevenue: "$45,230",
  activeSubscriptions: 892,
  serverStatus: "online",
  lastBackup: "2024-01-20 02:00 AM",
  storageUsed: "2.4 TB",
  storageTotal: "5.0 TB",
};

// Temporary farm data - now handled by backend API calls

// Temporary farm data is now retrieved through the actual backend API instead of local storage

// Temporary admin image data
const tempAdminImages: AdminPredictedImage[] = [
  {
    id: "66",
    src: "https://sodfcdrqpvcsblclppne.supabase.co/storage/v1/object/sign/Beans/uploads/34288323-8234-474d-9a35-713327ae5c8b/5b716e27-6456-4bf0-9e4d-0c6353218083.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNzRlYzA5MS0zNGY4LTRmOTItYmI1MS1hOWI3ZmQzYmM1MDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJCZWFucy91cGxvYWRzLzM0Mjg4MzIzLTgyMzQtNDc0ZC05YTM1LTcxMzMyN2FlNWM4Yi81YjcxNmUyNy02NDU2LTRiZjAtOWU0ZC0wYzYzNTMyMTgwODMucG5nIiwiaWF0IjoxNzU3NDIwNTk2LCJleHAiOjE3NTc0MjQxOTZ9.KStS8cvheHiKb3gxc-b8lFh_Gz0ZTj2YMTt9koDuCrY",
    userId: "34288323-8234-474d-9a35-713327ae5c8b",
    userName: "Jiro Meru",
    userRole: "farmer",
    locationId: null,
    locationName: null,
    submissionDate: "2025-09-09T10:53:36.635Z",
    is_validated: false,
    allegedVariety: null,
    predictions: [
      {
        bean_id: 1,
        is_validated: false,
        bean_type: "Alleged Liberica",
        confidence: 0.76,
        length_mm: 13.496,
        width_mm: 9.403,
        bbox: [1081, 165, 122, 85],
        comment: "",
        detection_date: "2025-09-09T10:53:38.722Z",
      },
      {
        bean_id: 2,
        is_validated: false,
        bean_type: "Alleged Liberica",
        confidence: 0.76,
        length_mm: 12.058,
        width_mm: 9.624,
        bbox: [215, 787, 109, 87],
        comment: "",
        detection_date: "2025-09-09T10:53:38.900Z",
      },
      {
        bean_id: 3,
        is_validated: false,
        bean_type: "Alleged Liberica",
        confidence: 0.76,
        length_mm: 13.496,
        width_mm: 9.182,
        bbox: [1094, 790, 122, 83],
        comment: "",
        detection_date: "2025-09-09T10:53:39.082Z",
      },
      {
        bean_id: 4,
        is_validated: false,
        bean_type: "Alleged Liberica",
        confidence: 0.76,
        length_mm: 13.939,
        width_mm: 8.296,
        bbox: [218, 202, 126, 75],
        comment: "",
        detection_date: "2025-09-09T10:53:39.264Z",
      },
    ],
  },
  {
    id: "67",
    src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
    userId: "12345678-9abc-def0-1234-567890abcdef",
    userName: "Maria Santos",
    userRole: "researcher",
    locationId: "farm1",
    locationName: "Santos Coffee Farm",
    submissionDate: "2025-09-08T14:30:15.123Z",
    is_validated: true,
    allegedVariety: "Robusta Premium",
    predictions: [
      {
        bean_id: 1,
        is_validated: true,
        bean_type: "Robusta",
        confidence: 0.89,
        length_mm: 11.234,
        width_mm: 8.567,
        bbox: [450, 230, 98, 76],
        comment: "Excellent specimen",
        detection_date: "2025-09-08T14:30:17.456Z",
      },
      {
        bean_id: 2,
        is_validated: true,
        bean_type: "Robusta",
        confidence: 0.92,
        length_mm: 10.875,
        width_mm: 8.234,
        bbox: [680, 456, 94, 72],
        comment: "Good quality",
        detection_date: "2025-09-08T14:30:17.789Z",
      },
    ],
  },
  // Legacy single bean prediction (for backward compatibility)
  {
    id: "120",
    src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
    userId: "12",
    userName: "Yajie Batumbakal",
    userRole: "researcher",
    locationId: "farm2",
    locationName: "Kenya Coffee Farm",
    submissionDate: "2024-01-15",
    is_validated: true,
    allegedVariety: "Arabica Premium",
    bean_type: "Arabica", // Legacy field
    predictions: {
      area: 1520.5,
      perimeter: 125.3,
      major_axis_length: 45.2,
      minor_axis_length: 32.1,
      extent: 0.75,
      eccentricity: 0.68,
      convex_area: 1530.2,
      solidity: 0.95,
      mean_intensity: 128.5,
      equivalent_diameter: 43.7,
      bean_type: "Arabica",
    },
  },
  {
    id: "121",
    src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
    userId: "12",
    userName: "Yajie Batumbakal",
    userRole: "researcher",
    locationId: "farm2",
    locationName: "Kenya Coffee Farm",
    submissionDate: "2024-01-15",
    is_validated: true,
    allegedVariety: "Arabica Classic",
    bean_type: "Arabica", // Legacy field
    predictions: {
      area: 1520.5,
      perimeter: 125.3,
      major_axis_length: 45.2,
      minor_axis_length: 32.1,
      extent: 0.75,
      eccentricity: 0.68,
      convex_area: 1530.2,
      solidity: 0.95,
      mean_intensity: 128.5,
      equivalent_diameter: 43.7,
      bean_type: "Arabica",
    },
  },
  {
    id: "122",
    src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
    userId: "12",
    userName: "Yajie Batumbakal",
    userRole: "researcher",
    locationId: "farm2",
    locationName: "Kenya Coffee Farm",
    submissionDate: "2024-01-15",
    is_validated: true,
    bean_type: "Arabica", // Legacy field
    predictions: {
      area: 1520.5,
      perimeter: 125.3,
      major_axis_length: 45.2,
      minor_axis_length: 32.1,
      extent: 0.75,
      eccentricity: 0.68,
      convex_area: 1530.2,
      solidity: 0.95,
      mean_intensity: 128.5,
      equivalent_diameter: 43.7,
      bean_type: "Arabica",
    },
  },
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
    userId: "1",
    userName: "John Smith",
    userRole: "farmer",
    locationId: "farm1",
    locationName: "Kenya Coffee Farm",
    submissionDate: "2024-01-15",
    is_validated: true,
    allegedVariety: "Liberica Premium",
    bean_type: "Liberica", // Legacy field
    predictions: {
      area: 1520.5,
      perimeter: 125.3,
      major_axis_length: 45.2,
      minor_axis_length: 32.1,
      extent: 0.75,
      eccentricity: 0.68,
      convex_area: 1530.2,
      solidity: 0.95,
      mean_intensity: 128.5,
      equivalent_diameter: 43.7,
      bean_type: "Liberica",
    },
  },

  {
    id: "2",
    src: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
    userId: "2",
    userName: "Maria Mercedes ang pangalan ko kaya ko nang magbanat ng buto",
    userRole: "farmer",
    locationId: "farm2",
    locationName: "Brazil Plantation",
    submissionDate: "2024-01-16",
    is_validated: false,
    bean_type: "Robusta", // Legacy field
    predictions: {
      area: 1480.2,
      perimeter: 120.8,
      major_axis_length: 42.8,
      minor_axis_length: 30.5,
      extent: 0.72,
      eccentricity: 0.65,
      convex_area: 1495.1,
      solidity: 0.93,
      mean_intensity: 125.2,
      equivalent_diameter: 41.3,
      bean_type: "Robusta",
    },
  },
  {
    id: "3",
    src: "https://images.unsplash.com/photo-1610632380989-680fe40816c6?w=400",
    userId: "2",
    userName: "Dr.Quack Quack",
    userRole: "researcher",
    locationId: "farm3",
    locationName: "Ethiopia Highlands",
    submissionDate: "2024-01-17",
    is_validated: true,
    allegedVariety: "Ethiopian Heirloom",
    bean_type: "Arabica", // Legacy field
    predictions: {
      area: 1620.8,
      perimeter: 130.2,
      major_axis_length: 48.1,
      minor_axis_length: 34.2,
      extent: 0.78,
      eccentricity: 0.71,
      convex_area: 1635.5,
      solidity: 0.97,
      mean_intensity: 132.1,
      equivalent_diameter: 45.8,
      bean_type: "Arabica",
    },
  },
  {
    id: "4",
    src: "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?w=400",
    userId: "3",
    userName: "Sara Di Binati",
    userRole: "farmer",
    locationId: "farm4",
    locationName: "Colombian Highlands",
    submissionDate: "2024-01-18",
    is_validated: false,
    bean_type: "Liberica", // Legacy field
    predictions: {
      area: 1380.5,
      perimeter: 115.6,
      major_axis_length: 39.8,
      minor_axis_length: 28.5,
      extent: 0.69,
      eccentricity: 0.62,
      convex_area: 1395.2,
      solidity: 0.91,
      mean_intensity: 122.8,
      equivalent_diameter: 38.9,
      bean_type: "Liberica",
    },
  },
  {
    id: "5",
    src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
    userId: "4",
    userName: "Carlos Fetizananahuhulog ang luob",
    userRole: "farmer",
    locationId: "farm1",
    locationName: "Kenya Coffee Farm",
    submissionDate: "2024-01-19",
    is_validated: true,
    allegedVariety: "Robusta Supreme",
    bean_type: "Robusta", // Legacy field
    predictions: {
      area: 1555.3,
      perimeter: 127.8,
      major_axis_length: 46.5,
      minor_axis_length: 33.1,
      extent: 0.76,
      eccentricity: 0.69,
      convex_area: 1568.9,
      solidity: 0.96,
      mean_intensity: 130.2,
      equivalent_diameter: 44.3,
      bean_type: "Robusta",
    },
  },
  {
    id: "6",
    src: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
    userId: "5",
    userName: "Bernadette De Momaccita",
    userRole: "researcher",
    locationId: "farm5",
    locationName: "Uganda Cooperative",
    submissionDate: "2024-01-20",
    is_validated: false,
    bean_type: "Robusta", // Legacy field
    predictions: {
      area: 1420.7,
      perimeter: 118.4,
      major_axis_length: 41.2,
      minor_axis_length: 29.8,
      extent: 0.71,
      eccentricity: 0.64,
      convex_area: 1438.1,
      solidity: 0.92,
      mean_intensity: 124.6,
      equivalent_diameter: 40.1,
      bean_type: "Robusta",
    },
  },
];

// Admin Dashboard Service
export class AdminService {
  // Get admin dashboard statistics
  static async getAdminStats(): Promise<AdminStats> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/stats');
      // return await response.json();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      return tempAdminStats;
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      throw error;
    }
  }

  // Get user activity data
  static async getUserActivity(): Promise<UserActivity[]> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/user-activity');
      // return await response.json();

      await new Promise((resolve) => setTimeout(resolve, 100));
      return tempUserActivity;
    } catch (error) {
      console.error("Error fetching user activity:", error);
      throw error;
    }
  }

  // Get bean submissions data
  static async getBeanSubmissions(): Promise<BeanSubmission[]> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/bean-submissions');
      // return await response.json();

      await new Promise((resolve) => setTimeout(resolve, 100));
      return tempBeanSubmissions;
    } catch (error) {
      console.error("Error fetching bean submissions:", error);
      throw error;
    }
  }

  // Get user logs data
  static async getUserLogs(): Promise<UserLog[]> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/user-logs');
      // return await response.json();

      await new Promise((resolve) => setTimeout(resolve, 100));
      return tempUserLogs;
    } catch (error) {
      console.error("Error fetching user logs:", error);
      throw error;
    }
  }

  // Get system status data
  static async getSystemStatus(): Promise<SystemStatus> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/system-status');
      // return await response.json();

      await new Promise((resolve) => setTimeout(resolve, 100));
      return tempSystemStatus;
    } catch (error) {
      console.error("Error fetching system status:", error);
      throw error;
    }
  }

  // Get user details by ID
  static async getUserDetails(userId: string): Promise<UserLog | null> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/users/${userId}`);
      // return await response.json();

      await new Promise((resolve) => setTimeout(resolve, 100));
      return tempUserLogs.find((user) => user.id === userId) || null;
    } catch (error) {
      console.error("Error fetching user details:", error);
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

      await new Promise((resolve) => setTimeout(resolve, 200));
      console.log(`System action performed: ${action}`);
      return true;
    } catch (error) {
      console.error("Error updating system status:", error);
      throw error;
    }
  }

  // User Management Methods
  static async getUsers(): Promise<UserManagementUser[]> {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_HOST_BE}/api/users/get-users/`
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
      const result = await res.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  static async createUser(userData: {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    role: string;
    location_id: string;
    is_active: boolean;
  }): Promise<UserLog> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST_BE}/api/users/create-user/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );
      await new Promise((resolve) => setTimeout(resolve, 200));

      return await response.json();
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async updateUser(
    userId: string,
    userData: {
      first_name: string;
      last_name: string;
      username: string;
      role: string;
      location_id: string;
      reset_password: boolean;
    }
  ): Promise<UserLog> {
    try {
      const user = { ...userData, id: userId };
      const response = await fetch(
        `${import.meta.env.VITE_HOST_BE}/api/users/update-user/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        }
      );
      await new Promise((resolve) => setTimeout(resolve, 200));

      return await response.json();
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST_BE}/api/users/delete-user/${userId}/`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      await new Promise((resolve) => setTimeout(resolve, 200));
      return response.ok;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  static async deactivateUser(userId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST_BE}/api/users/deactivate-user/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
      return response.ok;
    } catch (error) {
      console.error("Error deactivating user:", error);
      throw error;
    }
  }

  static async activateUser(userId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST_BE}/api/users/activate-user/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
      return response.ok;
    } catch (error) {
      console.error("Error activating user:", error);
      throw error;
    }
  }

  static async searchUsers(
    query: string,
    filters?: {
      role?: "Farmer" | "Researcher" | "Admin";
      location?: string;
    }
  ): Promise<UserLog[]> {
    try {
      // TODO: Replace with actual API call
      // const params = new URLSearchParams();
      // params.append('q', query);
      // if (filters?.role) params.append('role', filters.role);
      // if (filters?.location) params.append('location', filters.location);
      // const response = await fetch(`/api/admin/users/search?${params}`);
      // return await response.json();

      await new Promise((resolve) => setTimeout(resolve, 100));
      let filteredUsers = tempUserLogs;

      // Apply search filter
      if (query) {
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        );
      }

      // Apply role filter
      if (filters?.role) {
        filteredUsers = filteredUsers.filter(
          (user) => user.role === filters.role
        );
      }

      // Apply location filter (this would need to be added to the UserLog interface)
      if (filters?.location) {
        // For now, we'll skip location filtering since it's not in the UserLog interface
        // In a real implementation, you'd filter by location
      }

      return filteredUsers;
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  }

  // Activity logs
  static async getActivityLogs(): Promise<ActivityLog[]> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST_BE}/api/activity/logs/`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
      return await response.json();
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      throw error;
    }
  }

  // Admin Image Management Methods
  static async getImagesByStatus(
    status?: "verified" | "pending",
    filters?: AdminImageFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<{ images: AdminPredictedImage[]; pagination: PaginationData }> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (filters?.farm) params.append('farm', filters.farm);
      if (filters?.role) params.append('role', filters.role);
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/beans/get-images?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      return {
        images: result.images || [],
        pagination: result.pagination || {
          current_page: page,
          per_page: limit,
          total: 0,
          total_pages: 0,
          has_next: false,
          has_previous: false
        }
      };

    } catch (error) {
      console.error("Error fetching images by status:", error);
      throw error;
    }
  }

  static async deleteImage(id: string): Promise<boolean> {
    try {

      const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/beans/images/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.ok;

    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }

  static async editImage(
    id: string,
    data: Partial<AdminPredictedImage>
  ): Promise<AdminPredictedImage> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/images/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // return await response.json();

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Update temp data for simulation
      const index = tempAdminImages.findIndex((img) => img.id === id);
      if (index > -1) {
        tempAdminImages[index] = { ...tempAdminImages[index], ...data };
        return tempAdminImages[index];
      }

      throw new Error("Image not found");
    } catch (error) {
      console.error("Error editing image:", error);
      throw error;
    }
  }

  static async getImageById(id: string): Promise<AdminPredictedImage | null> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/images/${id}`);
      // return await response.json();

      await new Promise((resolve) => setTimeout(resolve, 100));
      return tempAdminImages.find((img) => img.id === id) || null;
    } catch (error) {
      console.error("Error fetching image by ID:", error);
      throw error;
    }
  }

  static async getUniqueLocations(): Promise<string[]> {
    try {
      const response = await supabase.from("locations").select("name");
      await new Promise((resolve) => setTimeout(resolve, 100));
      return (await response.data?.map((loc) => loc.name)) || [];
    } catch (error) {
      console.error("Error fetching unique locations:", error);
      throw error;
    }
  }

  // Farm Management Methods
  static async getFarms(): Promise<Farm[]> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(
        `${import.meta.env.VITE_HOST_BE}/api/farms/get-farms/`
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching farms:", error);
      throw error;
    }
  }

  static async getFarmDetails(farmId: string): Promise<FarmDetails | null> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST_BE}/api/farms/${farmId}/`
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
      return await response.json();

    } catch (error) {
      console.error("Error fetching farm details:", error);
      throw error;
    }
  }

  // New method for researcher/farmer simplified farm view
  static async getFarmView(farmId: string): Promise<{
    id: string;
    name: string;
    lat?: number;
    lng?: number;
    users: Array<{
      id: string;
      name: string;
      role: string;
      uploads: number;
    }>;
    recentImages: Array<{
      id: string;
      url: string;
      uploadDate: string;
      beanCount: number;
    }>;
    aggregatedData: {
      major_axis_length?: { value: number; overall: number; status: string };
      minor_axis_length?: { value: number; overall: number; status: string };
      area?: { value: number; overall: number; status: string };
      perimeter?: { value: number; overall: number; status: string };
      aspect_ratio?: { value: number; overall: number; status: string };
      circularity?: { value: number; overall: number; status: string };
      extent?: { value: number; overall: number; status: string };
      eccentricity?: { value: number; overall: number; status: string };
      solidity?: { value: number; overall: number; status: string };
      equivalent_diameter?: { value: number; overall: number; status: string };
    };
    beanTypes: string[];
    monthlyUploads: Array<{
      month: string;
      uploads: number;
    }>;
  } | null> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST_BE}/api/farms/${farmId}/view/`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching farm view data:", error);
      throw error;
    }
  }

  static async createFarm(farmData: {
    name: string;
    lat: number;
    lng: number;
  }): Promise<Farm> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const newFarm: Farm = {
        id: Date.now().toString(),
        name: farmData.name,
        lat: farmData.lat === 0 ? undefined : farmData.lat,
        lng: farmData.lng === 0 ? undefined : farmData.lng,
        hasLocation: farmData.lat !== 0 && farmData.lng !== 0,
        userCount: 0,
        imageCount: 0,
        avgBeanSize: 0,
        qualityRating: 0,
        lastActivity: "Never",
        createdDate: new Date().toISOString().split("T")[0],
        totalUploads: 0,
        validatedUploads: 0,
      };
      const response = await fetch(
        `${import.meta.env.VITE_HOST_BE}/api/farms/create/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newFarm),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error creating farm:", error);
      throw error;
    }
  }

  static async updateFarmLocation(
    farmId: string,
    lat: number,
    lng: number
  ): Promise<Farm> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST_BE}/api/farms/${farmId}/location/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng }),
        }
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
      return await response.json();
    } catch (error) {
      console.error("Error updating farm location:", error);
      throw error;
    }
  }

  static async deleteFarm(farmId: string): Promise<boolean> {
    try {
      console.log("Deleting farm with ID:", farmId);
      const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/farms/delete/`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farm_id: farmId })
      });
      await new Promise((resolve) => setTimeout(resolve, 200));
      return response.ok;
    } catch (error) {
      console.error("Error deleting farm:", error);
      throw error;
    }
  }
  static async getLocations(): Promise<{ id: string; name: string }[]> {
    try {
      const response = await supabase.from("locations").select("id, name");
      await new Promise((resolve) => setTimeout(resolve, 100));
      return (
        (await response.data?.map((loc) => ({ id: loc.id, name: loc.name }))) ||
        []
      );
    } catch (error) {
      console.error("Error fetching locations:", error);
      throw error;
    }
  }
}

export default AdminService;
