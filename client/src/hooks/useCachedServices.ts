import { useCache } from '@/contexts/CacheContext';
import { AdminService, type Farm } from '@/services/adminService';
import { AnnotationService, type AnnotationResponse } from '@/services/annotationService';
import type {
  AdminStats,
  UserActivity,
  BeanSubmission,
  UserLog,
  SystemStatus,
  AdminPredictedImage,
  AdminImageFilters,
  PaginationData,
  UserManagementUser
} from '@/interfaces/global';

export const useCachedAdminService = () => {
  const cache = useCache();

  return {
    // Admin Stats with caching
    getAdminStats: async (): Promise<AdminStats> => {
      const cacheKey = 'admin-stats:dashboard';
      const cached = cache.get<AdminStats>(cacheKey);
      
      if (cached) {
        return cached;
      }

      if (cache.isLoading(cacheKey)) {
        // Wait for ongoing request
        return new Promise((resolve) => {
          const checkCache = () => {
            const result = cache.get<AdminStats>(cacheKey);
            if (result || !cache.isLoading(cacheKey)) {
              resolve(result!);
            } else {
              setTimeout(checkCache, 100);
            }
          };
          checkCache();
        });
      }

      cache.setLoading(cacheKey, true);
      try {
        const data = await AdminService.getAdminStats();
        cache.set(cacheKey, data);
        return data;
      } finally {
        cache.setLoading(cacheKey, false);
      }
    },

    // User Activity with caching
    getUserActivity: async (): Promise<UserActivity[]> => {
      const cacheKey = 'user-activity:dashboard';
      const cached = cache.get<UserActivity[]>(cacheKey);
      
      if (cached) {
        return cached;
      }

      if (cache.isLoading(cacheKey)) {
        return new Promise((resolve) => {
          const checkCache = () => {
            const result = cache.get<UserActivity[]>(cacheKey);
            if (result || !cache.isLoading(cacheKey)) {
              resolve(result || []);
            } else {
              setTimeout(checkCache, 100);
            }
          };
          checkCache();
        });
      }

      cache.setLoading(cacheKey, true);
      try {
        const data = await AdminService.getUserActivity();
        cache.set(cacheKey, data);
        return data;
      } finally {
        cache.setLoading(cacheKey, false);
      }
    },

    // Bean Submissions with caching
    getBeanSubmissions: async (): Promise<BeanSubmission[]> => {
      const cacheKey = 'bean-submissions:dashboard';
      const cached = cache.get<BeanSubmission[]>(cacheKey);
      
      if (cached) {
        return cached;
      }

      if (cache.isLoading(cacheKey)) {
        return new Promise((resolve) => {
          const checkCache = () => {
            const result = cache.get<BeanSubmission[]>(cacheKey);
            if (result || !cache.isLoading(cacheKey)) {
              resolve(result || []);
            } else {
              setTimeout(checkCache, 100);
            }
          };
          checkCache();
        });
      }

      cache.setLoading(cacheKey, true);
      try {
        const data = await AdminService.getBeanSubmissions();
        cache.set(cacheKey, data);
        return data;
      } finally {
        cache.setLoading(cacheKey, false);
      }
    },

    // User Logs with caching
    getUserLogs: async (): Promise<UserLog[]> => {
      const cacheKey = 'user-logs:dashboard';
      const cached = cache.get<UserLog[]>(cacheKey);
      
      if (cached) {
        return cached;
      }

      if (cache.isLoading(cacheKey)) {
        return new Promise((resolve) => {
          const checkCache = () => {
            const result = cache.get<UserLog[]>(cacheKey);
            if (result || !cache.isLoading(cacheKey)) {
              resolve(result || []);
            } else {
              setTimeout(checkCache, 100);
            }
          };
          checkCache();
        });
      }

      cache.setLoading(cacheKey, true);
      try {
        const data = await AdminService.getUserLogs();
        cache.set(cacheKey, data);
        return data;
      } finally {
        cache.setLoading(cacheKey, false);
      }
    },

    // System Status with caching
    getSystemStatus: async (): Promise<SystemStatus> => {
      const cacheKey = 'admin-stats:system-status';
      const cached = cache.get<SystemStatus>(cacheKey);
      
      if (cached) {
        return cached;
      }

      if (cache.isLoading(cacheKey)) {
        return new Promise((resolve) => {
          const checkCache = () => {
            const result = cache.get<SystemStatus>(cacheKey);
            if (result || !cache.isLoading(cacheKey)) {
              resolve(result!);
            } else {
              setTimeout(checkCache, 100);
            }
          };
          checkCache();
        });
      }

      cache.setLoading(cacheKey, true);
      try {
        const data = await AdminService.getSystemStatus();
        cache.set(cacheKey, data);
        return data;
      } finally {
        cache.setLoading(cacheKey, false);
      }
    },

    // Images by Status with intelligent caching
    getImagesByStatus: async (
      status?: "verified" | "pending",
      filters?: AdminImageFilters,
      page: number = 1,
      limit: number = 10,
      searchParams?: {
        search_owner?: string;
        search_image_id?: string;
      }
    ): Promise<{ images: AdminPredictedImage[]; pagination: PaginationData }> => {
      // Create cache key based on all parameters
      const filterStr = filters ? JSON.stringify(filters) : '';
      const searchStr = searchParams ? JSON.stringify(searchParams) : '';
      const cacheKey = `images:${status || 'all'}:${filterStr}:${searchStr}:${page}:${limit}`;
      
      const cached = cache.get<{ images: AdminPredictedImage[]; pagination: PaginationData }>(cacheKey);
      
      if (cached) {
        return cached;
      }

      if (cache.isLoading(cacheKey)) {
        return new Promise((resolve) => {
          const checkCache = () => {
            const result = cache.get<{ images: AdminPredictedImage[]; pagination: PaginationData }>(cacheKey);
            if (result || !cache.isLoading(cacheKey)) {
              resolve(result || { images: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: limit, hasNext: false, hasPrevious: false } });
            } else {
              setTimeout(checkCache, 100);
            }
          };
          checkCache();
        });
      }

      cache.setLoading(cacheKey, true);
      try {
        const data = await AdminService.getImagesByStatus(status, filters, page, limit, searchParams);
        cache.set(cacheKey, data);
        return data;
      } finally {
        cache.setLoading(cacheKey, false);
      }
    },

    // User Management with caching
    getUsers: async (
      page: number = 1,
      limit: number = 10,
      searchParams?: {
        search_username?: string;
        role?: string;
        location?: string;
      }
    ): Promise<{ data: UserManagementUser[]; pagination: PaginationData }> => {
      const searchStr = searchParams ? JSON.stringify(searchParams) : '';
      const cacheKey = `user-management:${searchStr}:${page}:${limit}`;
      
      const cached = cache.get<{ data: UserManagementUser[]; pagination: PaginationData }>(cacheKey);
      
      if (cached) {
        return cached;
      }

      if (cache.isLoading(cacheKey)) {
        return new Promise((resolve) => {
          const checkCache = () => {
            const result = cache.get<{ data: UserManagementUser[]; pagination: PaginationData }>(cacheKey);
            if (result || !cache.isLoading(cacheKey)) {
              resolve(result || { data: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: limit, hasNext: false, hasPrevious: false } });
            } else {
              setTimeout(checkCache, 100);
            }
          };
          checkCache();
        });
      }

      cache.setLoading(cacheKey, true);
      try {
        const data = await AdminService.getUsers(page, limit, searchParams);
        cache.set(cacheKey, data);
        return data;
      } finally {
        cache.setLoading(cacheKey, false);
      }
    },

    // Locations with long-term caching
    getUniqueLocations: async (): Promise<string[]> => {
      const cacheKey = 'locations:unique';
      const cached = cache.get<string[]>(cacheKey);
      
      if (cached) {
        return cached;
      }

      if (cache.isLoading(cacheKey)) {
        return new Promise((resolve) => {
          const checkCache = () => {
            const result = cache.get<string[]>(cacheKey);
            if (result || !cache.isLoading(cacheKey)) {
              resolve(result || []);
            } else {
              setTimeout(checkCache, 100);
            }
          };
          checkCache();
        });
      }

      cache.setLoading(cacheKey, true);
      try {
        const data = await AdminService.getUniqueLocations();
        cache.set(cacheKey, data, 60 * 60 * 1000); // Cache for 1 hour
        return data;
      } finally {
        cache.setLoading(cacheKey, false);
      }
    },

    // Activity Logs with caching
    getActivityLogs: async () => {
      const cacheKey = 'activity-logs:all';
      const cached = cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      if (cache.isLoading(cacheKey)) {
        return new Promise((resolve) => {
          const checkCache = () => {
            const result = cache.get(cacheKey);
            if (result || !cache.isLoading(cacheKey)) {
              resolve(result || []);
            } else {
              setTimeout(checkCache, 100);
            }
          };
          checkCache();
        });
      }

      cache.setLoading(cacheKey, true);
      try {
        const data = await AdminService.getActivityLogs();
        cache.set(cacheKey, data);
        return data;
      } finally {
        cache.setLoading(cacheKey, false);
      }
    },

    // Methods that invalidate caches
    deleteImage: async (id: string): Promise<boolean> => {
      const result = await AdminService.deleteImage(id);
      if (result) {
        // Invalidate all images caches
        cache.invalidatePattern('images:');
        // Invalidate admin stats
        cache.invalidatePattern('admin-stats:');
      }
      return result;
    },

    uploadRecords: async (data: any, type: 'csv' | 'zip', onProgress?: (progress: number) => void) => {
      const result = await AdminService.uploadRecords(data, type, onProgress);
      if (result.success) {
        // Invalidate relevant caches
        cache.invalidatePattern('images:');
        cache.invalidatePattern('admin-stats:');
        cache.invalidatePattern('bean-submissions:');
      }
      return result;
    },

    editImage: async (id: string, data: Partial<AdminPredictedImage>) => {
      const result = await AdminService.editImage(id, data);
      // Invalidate relevant caches after editing
      cache.invalidatePattern('images:');
      cache.invalidatePattern('admin-stats:');
      return result;
    },

    getFarms: async (): Promise<Farm[]> => {
      const cacheKey = 'farms:list';
      const cached = cache.get<Farm[]>(cacheKey);
      
      if (cached) {
        return cached;
      }

      if (cache.isLoading(cacheKey)) {
        return new Promise((resolve) => {
          const checkCache = () => {
            const result = cache.get<Farm[]>(cacheKey);
            if (result || !cache.isLoading(cacheKey)) {
              resolve(result || []);
            } else {
              setTimeout(checkCache, 100);
            }
          };
          checkCache();
        });
      }

      cache.setLoading(cacheKey, true);
      try {
        const data = await AdminService.getFarms();
        cache.set(cacheKey, data);
        return data;
      } finally {
        cache.setLoading(cacheKey, false);
      }
    },

    getFarmView: async (farmId: string) => {
      const cacheKey = `farms:view:${farmId}`;
      const cached = cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      if (cache.isLoading(cacheKey)) {
        return new Promise((resolve) => {
          const checkCache = () => {
            const result = cache.get(cacheKey);
            if (result || !cache.isLoading(cacheKey)) {
              resolve(result || null);
            } else {
              setTimeout(checkCache, 100);
            }
          };
          checkCache();
        });
      }

      cache.setLoading(cacheKey, true);
      try {
        const data = await AdminService.getFarmView(farmId);
        cache.set(cacheKey, data);
        return data;
      } finally {
        cache.setLoading(cacheKey, false);
      }
    },

    // Cache management methods
    invalidateImagesCache: () => {
      cache.invalidatePattern('images:');
    },

    invalidateAdminStatsCache: () => {
      cache.invalidatePattern('admin-stats:');
    },

    invalidateUserManagementCache: () => {
      cache.invalidatePattern('user-management:');
    },

    invalidateActivityLogsCache: () => {
      cache.invalidatePattern('activity-logs:');
    },

    clearAllCache: () => {
      cache.clear();
    }
  };
};

export const useCachedAnnotationService = () => {
  const cache = useCache();

  return {
    getAnnotations: async (page: number = 1, limit: number = 100): Promise<AnnotationResponse> => {
      const cacheKey = `annotations:${page}:${limit}`;
      const cached = cache.get<AnnotationResponse>(cacheKey);
      
      if (cached) {
        return cached;
      }

      if (cache.isLoading(cacheKey)) {
        return new Promise((resolve) => {
          const checkCache = () => {
            const result = cache.get<AnnotationResponse>(cacheKey);
            if (result || !cache.isLoading(cacheKey)) {
              resolve(result || { 
                images: [], 
                pagination: { 
                  currentPage: 1, 
                  totalPages: 1, 
                  totalItems: 0, 
                  itemsPerPage: limit, 
                  hasNext: false, 
                  hasPrevious: false 
                } 
              });
            } else {
              setTimeout(checkCache, 100);
            }
          };
          checkCache();
        });
      }

      cache.setLoading(cacheKey, true);
      try {
        const data = await AnnotationService.getAnnotations(page, limit);
        cache.set(cacheKey, data);
        return data;
      } finally {
        cache.setLoading(cacheKey, false);
      }
    },

    validateBean: async (beanData: any) => {
      const result = await AnnotationService.validateBean(beanData);
      if (result) {
        // Invalidate annotations cache
        cache.invalidatePattern('annotations:');
        // Invalidate images cache
        cache.invalidatePattern('images:');
      }
      return result;
    },

    invalidateAnnotationsCache: () => {
      cache.invalidatePattern('annotations:');
    }
  };
};