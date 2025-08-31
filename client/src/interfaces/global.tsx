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