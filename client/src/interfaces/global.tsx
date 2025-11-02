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
  type: 'info' | 'alert' | 'system';
}

export interface User {
    id: string;  // Now required
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
  users: number;
  validated: number;
  uploads: number;
  pending: number;
  scatter_ratio_roundness: [{
    aspect_ratio: number;
    roundness: number;
  }];
  hist_aspect: {value: number, count: number}[];
  hist_roundness: {value: number, count: number}[];
  bean_types: { [key: string]: number };
  top_uploaders: Array<{
    user_id: number;
    name: string;
    upload_count: number;
  }>;
  farms: { [key: string]: { pending: number; validated: number } };
  corr_feats: Array<{
    id: string;
    data: Array<{ x: string; y: number }>;
  }>;
  total_predictions: number;
  avg_confidence: number;
  min_confidence: number;
  max_confidence: number;
  feature_stats: {
    [featureName: string]: {
      mean: Array<{ farm: string; value: number }>;
      median: Array<{ farm: string; value: number }>;
      mode: Array<{ farm: string; value: number }>;
    };
  };
  boxplot_features: {
    [featureName: string]: {
      [farmName: string]: number[];
    };
  };
  shape_size_distribution: {
    [farmName: string]: Array<{
      size: string;
      Round: number;
      Teardrop: number;
    }>;
  };
  shape_size_farm_names: string[];
  size_thresholds: {
    small_max: number;
    medium_min: number;
    medium_max: number;
    large_min: number;
  };
}

export interface UserManagementUser {
  id: string,
  first_name: string,
  last_name: string,
  is_active: boolean,
  last_login: string,
  username: string,
  role: 'farmer' | 'researcher' | 'admin',
  location__name: string,
  location_id: string,
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
export interface BeanDetection {
  bean_id: number;
  is_validated: boolean;
  bean_type: string;
  confidence: number;
  length_mm: number;
  width_mm: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
  comment: string;
  detection_date: string;
}

export interface AdminPredictedImage {
  id: string;
  src: string;
  userId: string;
  userName: string;
  userRole: 'farmer' | 'researcher';
  locationId: string | null;
  locationName: string | null;
  submissionDate: string;
  is_validated: boolean;
  allegedVariety?: string | null;
  // Legacy single bean prediction support (for backward compatibility)
  bean_type?: string;
  predictions?: {
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
  } | BeanDetection[]; // Can be either legacy format or new multi-bean format
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
  hasNext?: boolean;
  hasPrevious?: boolean;
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
  predictions: BeanDetection[];
}

export interface BeanDetection {
  bean_id: number;
  is_validated: boolean;
  bean_type: string;
  confidence: number;
  length_mm: number;
  width_mm: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
  comment: string;
  detection_date: string;
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

// New interfaces for multiple bean detection
export interface ProcessedBeanDetection {
  bean_id: number;
  length_mm: number;
  width_mm: number;
  bbox: [number, number, number, number];
  features: {
    area_mm2: number;
    perimeter_mm: number;
    major_axis_length_mm: number;
    minor_axis_length_mm: number;
    eccentricity: number;
    extent: number;
    equivalent_diameter_mm: number;
    solidity: number;
    mean_intensity: number;
    aspect_ratio: number;
  };
  comment?: string;
}

export interface ProcessedImageResult {
  image_id: string;
  image_dimensions_mm: {
    width: number;
    height: number;
  };
  calibration: {
    mm_per_pixel: number;
    marker_size_mm: number;
  };
  beans: ProcessedBeanDetection[];
  debug_images: {
    processed: string;
    debug: string;
    calibration: string;
  };
  total_beans_detected: number;
  error?: string;
}

export interface MultiImageProcessingResponse {
  images: ProcessedImageResult[];
  total_images_processed: number;
  total_beans_detected: number;
}

export type Location = {
    id: string;
    name: string;
};

export type ScatterRatioRoundness = {
    aspect_ratio: number;
    roundness: number;
};