/**
 * Bean Analysis Utility Functions
 * 
 * This module provides consistent calculation functions for bean analysis
 * across all modals and components.
 */

interface BeanFeatures {
  area_mm2?: number;
  perimeter_mm?: number;
  major_axis_length?: number;
  minor_axis_length?: number;
  solidity?: number;
  [key: string]: any;
}

interface BeanData {
  bean_id: number;
  length_mm: number;
  width_mm: number;
  features?: BeanFeatures;
  [key: string]: any;
}

/**
 * Calculate circularity of a bean
 * Formula: 4 * π * area / perimeter²
 * Value ranges from 0 (infinitely elongated) to 1 (perfect circle)
 */
export const calculateCircularity = (area: number, perimeter: number): number | null => {
  if (area <= 0 || perimeter <= 0) return null;
  return (4 * Math.PI * area) / (perimeter ** 2);
};

/**
 * Calculate aspect ratio of a bean
 * Formula: major_axis_length / minor_axis_length
 * Falls back to length_mm / width_mm if axis lengths are not available
 */
export const calculateAspectRatio = (bean: BeanData): number => {
  // Try to use major/minor axis lengths first
  if (bean.features?.major_axis_length && bean.features?.minor_axis_length) {
    return bean.features.major_axis_length / bean.features.minor_axis_length;
  }
  
  // Fall back to basic length/width ratio
  if (bean.width_mm > 0) {
    return bean.length_mm / bean.width_mm;
  }
  
  return 0;
};

/**
 * Get solidity value from bean features
 * Solidity is the ratio of bean area to its convex hull area
 */
export const getSolidity = (bean: BeanData): number | null => {
  return bean.features?.solidity || null;
};

/**
 * Calculate comprehensive metrics for a bean
 */
export const calculateBeanMetrics = (bean: BeanData) => {
  const circularity = bean.features?.area_mm2 && bean.features?.perimeter_mm
    ? calculateCircularity(bean.features.area_mm2, bean.features.perimeter_mm)
    : null;
    
  const aspectRatio = calculateAspectRatio(bean);
  const solidity = getSolidity(bean);
  
  return {
    circularity,
    aspectRatio,
    solidity,
    area: bean.features?.area_mm2 || 0,
    perimeter: bean.features?.perimeter_mm || 0,
    length: bean.length_mm,
    width: bean.width_mm
  };
};

/**
 * Find the largest bean by area
 */
export const findLargestBean = (beans: BeanData[]): BeanData | null => {
  if (beans.length === 0) return null;
  
  return beans.reduce((prev, current) => 
    (prev.features?.area_mm2 || 0) > (current.features?.area_mm2 || 0) ? prev : current
  );
};

/**
 * Find the smallest bean by area
 */
export const findSmallestBean = (beans: BeanData[]): BeanData | null => {
  if (beans.length === 0) return null;
  
  return beans.reduce((prev, current) => 
    (prev.features?.area_mm2 || 0) < (current.features?.area_mm2 || 0) ? prev : current
  );
};

/**
 * Calculate statistical summary for a collection of beans
 */
export const calculateBeanStatistics = (beans: BeanData[]) => {
  if (beans.length === 0) {
    return {
      totalBeans: 0,
      averageArea: 0,
      averageCircularity: 0,
      averageAspectRatio: 0,
      averageSolidity: 0,
      minArea: 0,
      maxArea: 0,
      sizeRatio: 0
    };
  }

  const areas = beans.map(b => b.features?.area_mm2 || 0).filter(a => a > 0);
  const circularities = beans
    .filter(b => b.features?.area_mm2 && b.features?.perimeter_mm)
    .map(b => calculateCircularity(b.features!.area_mm2!, b.features!.perimeter_mm!))
    .filter(c => c !== null) as number[];
  
  const aspectRatios = beans.map(b => calculateAspectRatio(b)).filter(r => r > 0);
  const solidities = beans
    .map(b => getSolidity(b))
    .filter(s => s !== null) as number[];

  const minArea = areas.length > 0 ? Math.min(...areas) : 0;
  const maxArea = areas.length > 0 ? Math.max(...areas) : 0;

  return {
    totalBeans: beans.length,
    averageArea: areas.length > 0 ? areas.reduce((sum, a) => sum + a, 0) / areas.length : 0,
    averageCircularity: circularities.length > 0 ? circularities.reduce((sum, c) => sum + c, 0) / circularities.length : 0,
    averageAspectRatio: aspectRatios.length > 0 ? aspectRatios.reduce((sum, r) => sum + r, 0) / aspectRatios.length : 0,
    averageSolidity: solidities.length > 0 ? solidities.reduce((sum, s) => sum + s, 0) / solidities.length : 0,
    minArea,
    maxArea,
    sizeRatio: minArea > 0 ? maxArea / minArea : 0
  };
};

/**
 * Categorize bean shape based on circularity and aspect ratio
 */
export const categorizeBeanShape = (circularity: number | null, aspectRatio: number): string => {
  if (circularity === null) {
    if (aspectRatio < 1.2) return 'Round';
    if (aspectRatio < 2.0) return 'Oval';
    return 'Elongated';
  }

  if (circularity > 0.8) return 'Very Round';
  if (circularity > 0.6) return 'Round';
  if (circularity > 0.4) return 'Oval';
  if (circularity > 0.2) return 'Elongated';
  return 'Irregular';
};

/**
 * Get quality assessment for a bean based on its metrics
 */
export const assessBeanQuality = (bean: BeanData): {
  quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  issues: string[];
  recommendations: string[];
} => {
  const metrics = calculateBeanMetrics(bean);
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check circularity
  if (metrics.circularity !== null && metrics.circularity < 0.3) {
    issues.push('Very irregular shape');
    recommendations.push('Check for bean damage or defects');
  }
  
  // Check aspect ratio
  if (metrics.aspectRatio > 3) {
    issues.push('Unusually elongated');
    recommendations.push('Verify measurement accuracy');
  }
  
  // Check size
  if (metrics.area < 10) {
    issues.push('Very small size');
    recommendations.push('Consider if this is a partial bean or debris');
  }
  
  // Determine overall quality
  let quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  if (issues.length === 0) {
    quality = 'Excellent';
  } else if (issues.length === 1) {
    quality = 'Good';
  } else if (issues.length === 2) {
    quality = 'Fair';
  } else {
    quality = 'Poor';
  }
  
  return { quality, issues, recommendations };
};

/**
 * Format a number for display in the UI
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

/**
 * Format feature value for display
 */
export const formatFeatureValue = (value: any): string => {
  if (typeof value === 'number') {
    return formatNumber(value, 3);
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

/**
 * Get bean styling based on its status (largest, smallest, normal)
 */
export const getBeanCardStyling = (
  bean: BeanData,
  largestBeanId: number,
  smallestBeanId: number
) => {
  const isLargest = bean.bean_id === largestBeanId;
  const isSmallest = bean.bean_id === smallestBeanId;
  
  return {
    cardClass: isLargest 
      ? "bg-white rounded-xl p-4 border-2 border-green-200 shadow-md"
      : isSmallest
      ? "bg-white rounded-xl p-4 border-2 border-orange-200 shadow-md"
      : "bg-white rounded-xl p-4 border border-gray-200 shadow-sm",
      
    headerColor: isLargest
      ? "text-green-800"
      : isSmallest
      ? "text-orange-800"
      : "text-gray-800",
      
    badgeClass: isLargest
      ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium"
      : isSmallest
      ? "bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium"
      : "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium",
      
    badgeText: isLargest ? "LARGEST" : isSmallest ? "SMALLEST" : `#${bean.bean_id}`,
    
    valueColor: isLargest
      ? 'text-green-700'
      : isSmallest
      ? 'text-orange-700'
      : 'text-gray-900'
  };
};

export default {
  calculateCircularity,
  calculateAspectRatio,
  getSolidity,
  calculateBeanMetrics,
  findLargestBean,
  findSmallestBean,
  calculateBeanStatistics,
  categorizeBeanShape,
  assessBeanQuality,
  formatNumber,
  formatFeatureValue,
  getBeanCardStyling
};