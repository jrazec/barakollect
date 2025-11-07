import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Cache configuration
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items to cache
}

interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
}

interface CacheContextType {
  // Core cache operations
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T, ttl?: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  
  // Cache management
  invalidatePattern: (pattern: string) => void;
  getStats: () => CacheStats;
  
  // Cache status
  isLoading: (key: string) => boolean;
  setLoading: (key: string, loading: boolean) => void;
  
  // Batch operations
  getMultiple: <T>(keys: string[]) => Record<string, T | null>;
  setMultiple: <T>(items: Array<{ key: string; data: T; ttl?: number }>) => void;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

// Default cache configurations for different data types
const CACHE_CONFIGS: Record<string, CacheConfig> = {
  'admin-stats': { ttl: 5 * 60 * 1000, maxSize: 10 }, // 5 minutes
  'user-activity': { ttl: 10 * 60 * 1000, maxSize: 50 }, // 10 minutes
  'bean-submissions': { ttl: 2 * 60 * 1000, maxSize: 100 }, // 2 minutes
  'images': { ttl: 15 * 60 * 1000, maxSize: 200 }, // 15 minutes
  'annotations': { ttl: 5 * 60 * 1000, maxSize: 100 }, // 5 minutes
  'farm-data': { ttl: 30 * 60 * 1000, maxSize: 50 }, // 30 minutes
  'user-management': { ttl: 10 * 60 * 1000, maxSize: 100 }, // 10 minutes
  'activity-logs': { ttl: 1 * 60 * 1000, maxSize: 50 }, // 1 minute
  'locations': { ttl: 60 * 60 * 1000, maxSize: 20 }, // 1 hour
  default: { ttl: 5 * 60 * 1000, maxSize: 100 } // 5 minutes default
};

// Storage keys
const CACHE_STORAGE_KEY = 'barakollect_cache';
const CACHE_STATS_KEY = 'barakollect_cache_stats';
const LOADING_STATES_KEY = 'barakollect_loading_states';

export const CacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cache, setCache] = useState<Map<string, CacheItem>>(new Map());
  const [loadingStates, setLoadingStates] = useState<Map<string, boolean>>(new Map());
  const [stats, setStats] = useState<CacheStats>({
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0
  });

  // Initialize cache from localStorage on mount
  useEffect(() => {
    try {
      const savedCache = localStorage.getItem(CACHE_STORAGE_KEY);
      const savedStats = localStorage.getItem(CACHE_STATS_KEY);
      
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);
        const cacheMap = new Map<string, CacheItem>();
        
        // Filter out expired items during initialization
        const now = Date.now();
        Object.entries(parsedCache).forEach(([key, item]: [string, any]) => {
          if (item.timestamp + item.ttl > now) {
            cacheMap.set(key, item);
          }
        });
        
        setCache(cacheMap);
      }
      
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }, []);

  // Save cache to localStorage whenever it changes
  useEffect(() => {
    try {
      const cacheObject = Object.fromEntries(cache);
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }, [cache]);

  // Save stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CACHE_STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.warn('Failed to save cache stats:', error);
    }
  }, [stats]);

  // Get cache configuration for a key
  const getCacheConfig = (key: string): CacheConfig => {
    for (const [pattern, config] of Object.entries(CACHE_CONFIGS)) {
      if (key.startsWith(pattern)) {
        return config;
      }
    }
    return CACHE_CONFIGS.default;
  };

  // Clean expired items
  const cleanExpiredItems = () => {
    const now = Date.now();
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      for (const [key, item] of newCache) {
        if (item.timestamp + item.ttl <= now) {
          newCache.delete(key);
        }
      }
      return newCache;
    });
  };

  // Enforce cache size limits
  const enforceCacheSize = (config: CacheConfig) => {
    setCache(prevCache => {
      const cacheArray = Array.from(prevCache.entries());
      if (cacheArray.length > config.maxSize) {
        // Remove oldest items
        cacheArray.sort((a, b) => a[1].timestamp - b[1].timestamp);
        const itemsToRemove = cacheArray.length - config.maxSize;
        for (let i = 0; i < itemsToRemove; i++) {
          prevCache.delete(cacheArray[i][0]);
        }
      }
      return new Map(prevCache);
    });
  };

  // Update stats
  const updateStats = (hit: boolean) => {
    setStats(prevStats => {
      const newStats = {
        ...prevStats,
        totalRequests: prevStats.totalRequests + 1,
        hits: hit ? prevStats.hits + 1 : prevStats.hits,
        misses: hit ? prevStats.misses : prevStats.misses + 1
      };
      newStats.hitRate = newStats.totalRequests > 0 ? (newStats.hits / newStats.totalRequests) * 100 : 0;
      return newStats;
    });
  };

  const get = <T,>(key: string): T | null => {
    const item = cache.get(key);
    
    if (!item) {
      updateStats(false);
      return null;
    }

    // Check if item has expired
    if (Date.now() > item.timestamp + item.ttl) {
      setCache(prevCache => {
        const newCache = new Map(prevCache);
        newCache.delete(key);
        return newCache;
      });
      updateStats(false);
      return null;
    }

    updateStats(true);
    return item.data as T;
  };

  const set = <T,>(key: string, data: T, customTtl?: number): void => {
    const config = getCacheConfig(key);
    const ttl = customTtl || config.ttl;
    
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key
    };

    setCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.set(key, item);
      return newCache;
    });

    // Clean up and enforce size limits
    cleanExpiredItems();
    enforceCacheSize(config);
  };

  const remove = (key: string): void => {
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.delete(key);
      return newCache;
    });
  };

  const clear = (): void => {
    setCache(new Map());
    setLoadingStates(new Map());
    localStorage.removeItem(CACHE_STORAGE_KEY);
    localStorage.removeItem(CACHE_STATS_KEY);
  };

  const invalidatePattern = (pattern: string): void => {
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      for (const key of newCache.keys()) {
        if (key.includes(pattern)) {
          newCache.delete(key);
        }
      }
      return newCache;
    });
  };

  const getStats = (): CacheStats => stats;

  const isLoading = (key: string): boolean => {
    return loadingStates.get(key) || false;
  };

  const setLoading = (key: string, loading: boolean): void => {
    setLoadingStates(prevStates => {
      const newStates = new Map(prevStates);
      if (loading) {
        newStates.set(key, true);
      } else {
        newStates.delete(key);
      }
      return newStates;
    });
  };

  const getMultiple = <T,>(keys: string[]): Record<string, T | null> => {
    const result: Record<string, T | null> = {};
    keys.forEach(key => {
      result[key] = get<T>(key);
    });
    return result;
  };

  const setMultiple = <T,>(items: Array<{ key: string; data: T; ttl?: number }>): void => {
    items.forEach(({ key, data, ttl }) => {
      set(key, data, ttl);
    });
  };

  const value: CacheContextType = {
    get,
    set,
    remove,
    clear,
    invalidatePattern,
    getStats,
    isLoading,
    setLoading,
    getMultiple,
    setMultiple
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = (): CacheContextType => {
  const context = useContext(CacheContext);
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};

// Helper hook for cached API calls
export const useCachedData = <T,>(
  key: string,
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  ttl?: number
) => {
  const cache = useCache();
  const [data, setData] = useState<T | null>(cache.get<T>(key));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cachedData = cache.get<T>(key);
      if (cachedData) {
        setData(cachedData);
        return cachedData;
      }
    }

    if (cache.isLoading(key)) {
      return;
    }

    setLoading(true);
    cache.setLoading(key, true);
    setError(null);

    try {
      const result = await fetchFn();
      cache.set(key, result, ttl);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
      cache.setLoading(key, false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    data,
    loading: loading || cache.isLoading(key),
    error,
    refetch: () => fetchData(true),
    invalidate: () => {
      cache.remove(key);
      setData(null);
    }
  };
};

export default CacheContext;