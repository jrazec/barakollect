import type { SignInWithPasswordCredentials } from "@supabase/supabase-js";

export interface CardAttributes {
    title: string,
    subtitle: string,
    content: React.ReactNode,
    description?: React.ReactNode,
};


export interface Stat {
  label: string;
  value: string;
  subtext?: string;
}

export interface NotifAttributes {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type?: 'info' | 'warning' | 'error';
}

export interface User {
    name: string,
    role: string
}

export interface NavItems {
    icon: React.ReactNode,
    label: string,
    route?: string,
    active?: boolean
}


export type NavItem = {
  label: string;
  icon: React.ReactNode;
  route: string;
  active?: boolean;
};

export type SidebarNavProps = {
  changeActiveNav: Function;
  show: boolean;
  navigationItems:Record<string, NavItems[]>;
  role: string;
};

export type LoginFormType = {
  email : string,
  password: string
}

// Admin Dashboard Interfaces
export interface UserLog {
  id: string;
  name: string;
  role: 'Farmer' | 'Researcher' | 'Admin';
  action: string;
  lastActive: string;
  email: string;
  status: 'active' | 'inactive';
  joinDate: string;
  totalUploads: number;
  totalValidations: number;
}

export interface SystemStatus {
  systemUptime: string;
  pendingPayments: number;
  duePayments: number;
  totalRevenue: string;
  activeSubscriptions: number;
  serverStatus: 'online' | 'offline' | 'maintenance';
  lastBackup: string;
  storageUsed: string;
  storageTotal: string;
}

export interface BeanSubmission {
  id: string;
  farmerName: string;
  beanType: string;
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  location: string;
  quantity: number;
  quality: number;
}

export interface UserActivity {
  date: string;
  farmers: number;
  researchers: number;
  total: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalUploads: number;
  pendingValidations: number;
}

export interface UserManagementUser {
  id: string,
  first_name: string,
  last_name: string,
  is_active: boolean,
  last_login: string,
  username: string,
  role: 'farmer' | 'researcher' | 'admin',
  location: string,
  email: string,
  is_deleted?: boolean,
  created_at?: string,
  updated_at?: string,
}


export interface ActivityLog {
  id: number;
  timestamp: string;
  user: string;
  userType: 'researcher' | 'admin' | 'farmer' | 'system';
  action: string;
  resource: string;
  status: 'success' | 'failed' | 'warning';
  ipAddress: string;
  details: string;
}

// Admin Beans Gallery Interfaces
export interface AdminPredictedImage {
  id: string;
  src: string;
  userId: string;
  userName: string;
  userRole: 'farmer' | 'researcher';
  locationId: string;
  locationName: string;
  submissionDate: string;
  validated: 'verified' | 'pending';
  allegedVariety?: string;
  predictions: {
    area: number;
    perimeter: number;
    major_axis_length: number;
    minor_axis_length: number;
    extent: number;
    eccentricity: number;
    convex_area: number;
    solidity: number;
    mean_intensity: number;
    equivalent_diameter: number;
    bean_type: string;
  };
}

export interface AdminImageFilters {
  farm?: string;
  role?: 'farmer' | 'researcher';
  status?: 'verified' | 'pending';
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// New interfaces for bean validation features
export interface BeanImage {
  id: string;
  src: string;
  userId: string;
  userName: string;
  userRole: 'farmer' | 'researcher';
  locationId: string;
  locationName: string;
  submissionDate: string;
  is_validated: boolean;
  allegedVariety?: string;
  predictions: {
    area: number;
    perimeter: number;
    major_axis_length: number;
    minor_axis_length: number;
    extent: number;
    eccentricity: number;
    convex_area: number;
    solidity: number;
    mean_intensity: number;
    equivalent_diameter: number;
    bean_type: string;
  };
}

export interface FarmFolder {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  hasAccess: boolean;
  isLocked: boolean;
  imageCount: number;
  validatedCount: number;
  type: 'own' | 'farm';
}

export interface AccessRequest {
  id: string;
  researcherId: string;
  researcherName: string;
  farmId: string;
  farmName: string;
  farmOwnerId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  respondedAt?: string;
}

export interface NotificationItem {
  id: string;
  type: 'access_request' | 'access_granted' | 'access_denied' | 'general';
  title: string;
  message: string;
  fromUserId?: string;
  fromUserName?: string;
  relatedEntityId?: string; // farm id, request id, etc.
  read: boolean;
  createdAt: string;
  actionRequired?: boolean;
  actionData?: any;
}