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
  BeanImage,
  FarmFolder,
} from "@/interfaces/global";

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
  owner: string;
  createdDate: string;
  totalUploads: number;
  validatedUploads: number;
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
    avgBeanLength: number;
    avgBeanWidth: number;
    avgBeanArea: number;
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

// Temporary farm data
const tempFarms: Farm[] = [
  {
    id: '1',
    name: 'Sunrise Coffee Farm',
    lat: 13.956626112464809,
    lng: 121.16317033767702,
    hasLocation: true,
    userCount: 15,
    imageCount: 234,
    avgBeanSize: 13.2,
    qualityRating: 4.2,
    lastActivity: '2 hours ago',
    owner: 'John Smith',
    createdDate: '2023-03-15',
    totalUploads: 234,
    validatedUploads: 198
  },
  {
    id: '2',
    name: 'Mountain View Plantation',
    lat: 13.950,
    lng: 121.150,
    hasLocation: true,
    userCount: 23,
    imageCount: 456,
    avgBeanSize: 12.8,
    qualityRating: 4.5,
    lastActivity: '1 day ago',
    owner: 'Maria Garcia',
    createdDate: '2023-01-10',
    totalUploads: 456,
    validatedUploads: 398
  },
  {
    id: '3',
    name: 'Highland Coffee Estate',
    lat: 13.940,
    lng: 121.160,
    hasLocation: true,
    userCount: 8,
    imageCount: 123,
    avgBeanSize: 14.1,
    qualityRating: 3.9,
    lastActivity: '3 hours ago',
    owner: 'Ahmed Hassan',
    createdDate: '2023-06-22',
    totalUploads: 123,
    validatedUploads: 89
  },
  {
    id: '4',
    name: 'Valley Green Farm',
    hasLocation: false,
    userCount: 5,
    imageCount: 67,
    avgBeanSize: 13.8,
    qualityRating: 4.1,
    lastActivity: '1 week ago',
    owner: 'Sarah Johnson',
    createdDate: '2023-08-10',
    totalUploads: 67,
    validatedUploads: 45
  },
  {
    id: '5',
    name: 'Riverbank Coffee Co.',
    hasLocation: false,
    userCount: 12,
    imageCount: 189,
    avgBeanSize: 12.9,
    qualityRating: 3.7,
    lastActivity: '5 days ago',
    owner: 'Carlos Rodriguez',
    createdDate: '2023-04-18',
    totalUploads: 189,
    validatedUploads: 156
  }
];

const tempFarmDetails: Record<string, FarmDetails> = {
  '1': {
    ...tempFarms[0],
    users: [
      { id: 'u1', name: 'John Smith', role: 'Owner', uploads: 89 },
      { id: 'u2', name: 'Alice Johnson', role: 'Farmer', uploads: 67 },
      { id: 'u3', name: 'Bob Wilson', role: 'Researcher', uploads: 78 }
    ],
    recentImages: [
      { id: 'img1', url: '/api/images/recent1.jpg', uploadDate: '2024-01-20', beanCount: 15 },
      { id: 'img2', url: '/api/images/recent2.jpg', uploadDate: '2024-01-19', beanCount: 12 },
      { id: 'img3', url: '/api/images/recent3.jpg', uploadDate: '2024-01-18', beanCount: 18 }
    ],
    aggregatedData: {
      avgBeanLength: 8.5,
      avgBeanWidth: 6.2,
      avgBeanArea: 42.3,
      commonBeanTypes: ['Arabica', 'Robusta'],
      qualityDistribution: { 'Excellent': 45, 'Good': 35, 'Average': 20 },
      monthlyUploads: [
        { month: 'Jan', count: 45 },
        { month: 'Feb', count: 52 },
        { month: 'Mar', count: 38 }
      ]
    }
  },
  '2': {
    ...tempFarms[1],
    users: [
      { id: 'u4', name: 'Maria Garcia', role: 'Owner', uploads: 156 },
      { id: 'u5', name: 'Pedro Santos', role: 'Farmer', uploads: 123 },
      { id: 'u6', name: 'Ana Rodriguez', role: 'Quality Control', uploads: 177 }
    ],
    recentImages: [
      { id: 'img4', url: '/api/images/recent4.jpg', uploadDate: '2024-01-20', beanCount: 20 },
      { id: 'img5', url: '/api/images/recent5.jpg', uploadDate: '2024-01-19', beanCount: 16 }
    ],
    aggregatedData: {
      avgBeanLength: 9.1,
      avgBeanWidth: 6.8,
      avgBeanArea: 48.7,
      commonBeanTypes: ['Arabica', 'Liberica'],
      qualityDistribution: { 'Excellent': 60, 'Good': 30, 'Average': 10 },
      monthlyUploads: [
        { month: 'Jan', count: 67 },
        { month: 'Feb', count: 78 },
        { month: 'Mar', count: 65 }
      ]
    }
  }
};

// Temporary admin image data
const tempAdminImages: AdminPredictedImage[] = [
  {
    id: "120",
    src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
    userId: "12",
    userName: "Yajie Batumbakal",
    userRole: "researcher",
    locationId: "farm2",
    locationName: "Kenya Coffee Farm",
    submissionDate: "2024-01-15",
    validated: "verified",
    allegedVariety: "Arabica Premium",
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
    validated: "verified",
    allegedVariety: "Arabica Classic",
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
    validated: "verified",
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
    validated: "verified",
    allegedVariety: "Liberica Premium",
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
    id: "2",
    src: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
    userId: "2",
    userName: "Maria Mercedes ang pangalan ko kaya ko nang magbanat ng buto",
    userRole: "farmer",
    locationId: "farm2",
    locationName: "Brazil Plantation",
    submissionDate: "2024-01-16",
    validated: "pending",
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
    validated: "verified",
    allegedVariety: "Ethiopian Heirloom",
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
    validated: "pending",
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
    validated: "verified",
    allegedVariety: "Robusta Supreme",
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
      bean_type: "Arabica",
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
    validated: "pending",
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

// Temporary farm folders for researchers
const tempFarmFolders: FarmFolder[] = [
  {
    id: "own",
    name: "Own",
    ownerId: "researcher1",
    ownerName: "Current User",
    hasAccess: true,
    isLocked: false,
    imageCount: 25,
    validatedCount: 18,
    type: "own"
  },
  {
    id: "farm1",
    name: "Sunrise Coffee Farm",
    ownerId: "farmer1",
    ownerName: "John Smith",
    hasAccess: true,
    isLocked: false,
    imageCount: 45,
    validatedCount: 32,
    type: "farm"
  },
  {
    id: "farm2",
    name: "Mountain View Plantation",
    ownerId: "farmer2",
    ownerName: "Maria Garcia",
    hasAccess: false,
    isLocked: true,
    imageCount: 67,
    validatedCount: 45,
    type: "farm"
  },
  {
    id: "farm3",
    name: "Highland Coffee Estate",
    ownerId: "farmer3",
    ownerName: "Ahmed Hassan",
    hasAccess: false,
    isLocked: true,
    imageCount: 38,
    validatedCount: 28,
    type: "farm"
  }
];

// Temporary bean images for researcher annotations
const tempBeanImages: BeanImage[] = tempAdminImages.map(img => ({
  ...img,
  validated: img.validated === 'verified',
}));

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
    location: string;
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
      location: string;
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
      // TODO: Replace with actual API call
      // const params = new URLSearchParams();
      // if (status) params.append('status', status);
      // if (filters?.farm) params.append('farm', filters.farm);
      // if (filters?.role) params.append('role', filters.role);
      // params.append('page', page.toString());
      // params.append('limit', limit.toString());
      // const response = await fetch(`/api/admin/images?${params}`);
      // return await response.json();

      await new Promise((resolve) => setTimeout(resolve, 100));

      let filteredImages = [...tempAdminImages];

      // Apply status filter
      if (status) {
        filteredImages = filteredImages.filter(
          (img) => img.validated === status
        );
      }

      // Apply farm filter
      if (filters?.farm) {
        filteredImages = filteredImages.filter(
          (img) => img.locationName === filters.farm
        );
      }

      // Apply role filter
      if (filters?.role) {
        filteredImages = filteredImages.filter(
          (img) => img.userRole === filters.role
        );
      }

      // Apply pagination
      const totalItems = filteredImages.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedImages = filteredImages.slice(startIndex, endIndex);

      return {
        images: paginatedImages,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      console.error("Error fetching images by status:", error);
      throw error;
    }
  }

  static async deleteImage(id: string): Promise<boolean> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/images/${id}`, {
      //   method: 'DELETE',
      //   headers: { 'Content-Type': 'application/json' },
      // });
      // return response.ok;

      await new Promise((resolve) => setTimeout(resolve, 200));
      console.log(`Image ${id} deleted`);

      // Remove from temp data for simulation
      const index = tempAdminImages.findIndex((img) => img.id === id);
      if (index > -1) {
        tempAdminImages.splice(index, 1);
      }

      return true;
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
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/locations');
      // return await response.json();

      await new Promise((resolve) => setTimeout(resolve, 100));
      const locations = [
        ...new Set(tempAdminImages.map((img) => img.locationName)),
      ];
      return locations;
    } catch (error) {
      console.error("Error fetching unique locations:", error);
      throw error;
    }
  }

  // Farm Management Methods
  static async getFarms(): Promise<Farm[]> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/admin/farms/`);
      // return await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      return tempFarms;
    } catch (error) {
      console.error('Error fetching farms:', error);
      throw error;
    }
  }

  static async getFarmDetails(farmId: string): Promise<FarmDetails | null> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/admin/farms/${farmId}/`);
      // return await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      return tempFarmDetails[farmId] || null;
    } catch (error) {
      console.error('Error fetching farm details:', error);
      throw error;
    }
  }

  static async createFarm(farmData: {
    name: string;
    lat: number;
    lng: number;
    owner: string;
  }): Promise<Farm> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/admin/farms/`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(farmData)
      // });
      // return await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 200));
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
        lastActivity: 'Never',
        owner: farmData.owner,
        createdDate: new Date().toISOString().split('T')[0],
        totalUploads: 0,
        validatedUploads: 0
      };
      
      tempFarms.push(newFarm);
      return newFarm;
    } catch (error) {
      console.error('Error creating farm:', error);
      throw error;
    }
  }

  static async updateFarmLocation(farmId: string, lat: number, lng: number): Promise<Farm> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/admin/farms/${farmId}/location/`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ lat, lng })
      // });
      // return await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 200));
      const farmIndex = tempFarms.findIndex(f => f.id === farmId);
      if (farmIndex !== -1) {
        tempFarms[farmIndex] = {
          ...tempFarms[farmIndex],
          lat,
          lng,
          hasLocation: true
        };
        return tempFarms[farmIndex];
      }
      throw new Error('Farm not found');
    } catch (error) {
      console.error('Error updating farm location:', error);
      throw error;
    }
  }

  static async deleteFarm(farmId: string): Promise<boolean> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/admin/farms/${farmId}/`, {
      //   method: 'DELETE'
      // });
      // return response.ok;
      
      await new Promise(resolve => setTimeout(resolve, 200));
      const farmIndex = tempFarms.findIndex(f => f.id === farmId);
      if (farmIndex !== -1) {
        tempFarms.splice(farmIndex, 1);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting farm:', error);
      throw error;
    }
  }

  // Bean Image Management Methods for Researcher Annotations
  static async getFarmFolders(researcherId: string): Promise<FarmFolder[]> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/researcher/farm-folders/${researcherId}/`);
      // return await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      return tempFarmFolders;
    } catch (error) {
      console.error('Error fetching farm folders:', error);
      throw error;
    }
  }

  static async getBeanImagesByFarm(
    farmId: string,
    researcherId: string,
    validated?: boolean,
    page: number = 1,
    limit: number = 20
  ): Promise<{ images: BeanImage[]; pagination: PaginationData }> {
    try {
      // TODO: Replace with actual API call
      // const params = new URLSearchParams();
      // if (validated !== undefined) params.append('validated', validated.toString());
      // params.append('page', page.toString());
      // params.append('limit', limit.toString());
      // const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/researcher/farm-images/${farmId}?${params}`);
      // return await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let filteredImages = [...tempBeanImages];
      
      // Filter by farm or researcher's own images
      if (farmId === 'own') {
        filteredImages = filteredImages.filter(img => img.userId === researcherId);
      } else {
        filteredImages = filteredImages.filter(img => img.locationId === farmId);
      }
      
      // Filter by validation status if specified
      if (validated !== undefined) {
        filteredImages = filteredImages.filter(img => img.validated === validated);
      }
      
      // Apply pagination
      const totalItems = filteredImages.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedImages = filteredImages.slice(startIndex, endIndex);
      
      return {
        images: paginatedImages,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      console.error('Error fetching bean images by farm:', error);
      throw error;
    }
  }

  static async annotateBeanImage(
    imageId: string,
    annotations: {
      allegedVariety?: string;
      validated: boolean;
      notes?: string;
    }
  ): Promise<BeanImage> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/researcher/annotate/${imageId}/`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(annotations)
      // });
      // return await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Update in temp data
      const imageIndex = tempBeanImages.findIndex(img => img.id === imageId);
      if (imageIndex !== -1) {
        tempBeanImages[imageIndex] = {
          ...tempBeanImages[imageIndex],
          ...annotations
        };
        
        // Also update in admin images
        const adminImageIndex = tempAdminImages.findIndex(img => img.id === imageId);
        if (adminImageIndex !== -1) {
          tempAdminImages[adminImageIndex] = {
            ...tempAdminImages[adminImageIndex],
            validated: annotations.validated ? 'verified' : 'pending',
            allegedVariety: annotations.allegedVariety
          };
        }
        
        return tempBeanImages[imageIndex];
      }
      
      throw new Error('Image not found');
    } catch (error) {
      console.error('Error annotating bean image:', error);
      throw error;
    }
  }

  static async getUserImages(
    userId: string,
    userRole: 'farmer' | 'researcher',
    validated?: boolean
  ): Promise<BeanImage[]> {
    try {
      // TODO: Replace with actual API call
      // const params = new URLSearchParams();
      // if (validated !== undefined) params.append('validated', validated.toString());
      // const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/users/${userId}/images?${params}`);
      // return await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let filteredImages = tempBeanImages.filter(img => 
        img.userId === userId && img.userRole === userRole
      );
      
      if (validated !== undefined) {
        filteredImages = filteredImages.filter(img => img.validated === validated);
      }
      
      return filteredImages;
    } catch (error) {
      console.error('Error fetching user images:', error);
      throw error;
    }
  }
}

export default AdminService;
