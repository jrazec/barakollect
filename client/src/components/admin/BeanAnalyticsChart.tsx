import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line } from 'recharts';
import StatCard from '@/components/StatCard';

interface FeatureStats {
  [featureName: string]: {
    mean: Array<{ farm: string; value: number }>;
    median: Array<{ farm: string; value: number }>;
    mode: Array<{ farm: string; value: number }>;
  };
}

interface BoxplotFeatures {
  [featureName: string]: {
    [farmName: string]: number[];
  };
}

interface BeanAnalyticsChartProps {
  totalPredictions: number;
  avgConfidence: number;
  minConfidence: number;
  maxConfidence: number;
  featureStats: FeatureStats;
  boxplotFeatures: BoxplotFeatures;
}

const BeanAnalyticsChart: React.FC<BeanAnalyticsChartProps> = ({
  totalPredictions,
  avgConfidence,
  minConfidence,
  maxConfidence,
  featureStats,
  boxplotFeatures
}) => {
  const [selectedFeature, setSelectedFeature] = useState<string>('area');
  const [selectedFarm, setSelectedFarm] = useState<string>('all');

  const featureNames = Object.keys(featureStats);
  const displayNames: { [key: string]: string } = {
    'area': 'Area',
    'perimeter': 'Perimeter',
    'major_axis_length': 'Major Axis Length',
    'minor_axis_length': 'Minor Axis Length',
    'extent': 'Extent',
    'eccentricity': 'Eccentricity',
    'convex_area': 'Convex Area',
    'solidity': 'Solidity',
    'mean_intensity': 'Mean Intensity',
    'equivalent_diameter': 'Equivalent Diameter'
  };

  // Get unique farm names from the data
  const getFarmNames = () => {
    if (!featureStats[selectedFeature]) return [];
    const farms = featureStats[selectedFeature].mean.map(item => item.farm);
    return ['all', ...farms];
  };

  const farmNames = getFarmNames();

  const getCurrentFeatureData = () => {
    if (!featureStats[selectedFeature]) return { mean: [], median: [], mode: [] };
    
    const data = featureStats[selectedFeature];
    
    // If "all" is selected, return all data
    if (selectedFarm === 'all') {
      return data;
    }
    
    // Filter data by selected farm
    return {
      mean: data.mean.filter(item => item.farm === selectedFarm),
      median: data.median.filter(item => item.farm === selectedFarm),
      mode: data.mode.filter(item => item.farm === selectedFarm)
    };
  };

  const currentData = getCurrentFeatureData();

  // Calculate statistics for selected farm
  const getStatistics = () => {
    if (selectedFarm === 'all' || !currentData.mean.length) return null;
    
    return {
      mean: currentData.mean[0]?.value || 0,
      median: currentData.median[0]?.value || 0,
      mode: currentData.mode[0]?.value || 0
    };
  };

  const statistics = getStatistics();

  // Create histogram data for selected farm and feature
  const getDistributionData = () => {
    if (selectedFarm === 'all' || !boxplotFeatures[selectedFeature] || !boxplotFeatures[selectedFeature][selectedFarm]) {
      return [];
    }

    const values = boxplotFeatures[selectedFeature][selectedFarm];
    
    if (!values || values.length === 0) return [];

    // Determine bin size based on the range of values
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    // Create approximately 20-30 bins
    const numBins = Math.min(30, Math.max(10, Math.ceil(range / 10)));
    const binSize = range / numBins;

    // Create bins
    const bins: { [key: string]: number } = {};
    values.forEach(value => {
      const binKey = (Math.floor(value / binSize) * binSize).toFixed(2);
      bins[binKey] = (bins[binKey] || 0) + 1;
    });

    // Convert to array format for Recharts
    return Object.entries(bins)
      .map(([value, count]) => ({ value: parseFloat(value), count }))
      .sort((a, b) => a.value - b.value);
  };

  const distributionData = getDistributionData();

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Predictions"
          value={totalPredictions.toLocaleString()}
          subtext="Bean predictions made"
        />
        <StatCard
          label="Avg Confidence"
          value={`${(avgConfidence * 100).toFixed(1)}%`}
          subtext="Average prediction confidence"
        />
        <StatCard
          label="Min Confidence"
          value={`${(minConfidence * 100).toFixed(1)}%`}
          subtext="Lowest prediction confidence"
        />
        <StatCard
          label="Max Confidence"
          value={`${(maxConfidence * 100).toFixed(1)}%`}
          subtext="Highest prediction confidence"
        />
      </div>

      {/* Feature Selection */}
      <div className="bg-[var(--parchment)] rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-lg font-main font-bold text-[var(--espresso-black)] mb-2">
            Feature Analysis by Farm
          </h3>
          <p className="text-sm font-accent text-gray-600 mb-6">
            Select a feature to view mean, median, and mode statistics across farms
          </p>
          
          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Feature Selector Dropdown */}
            <div className="relative">
              <label className="block text-xs font-semibold text-[var(--espresso-black)] mb-2 uppercase tracking-wide">
                📊 Select Feature
              </label>
              <div className="relative">
                <select
                  value={selectedFeature}
                  onChange={(e) => setSelectedFeature(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border-2 border-[var(--arabica-brown)] rounded-lg text-sm font-medium bg-white text-[var(--espresso-black)] hover:border-[#8B4513] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:ring-opacity-50 focus:border-[#8B4513] transition-all duration-200 appearance-none cursor-pointer shadow-sm"
                  style={{ backgroundImage: 'none' }}
                >
                  {featureNames.map((feature) => (
                    <option key={feature} value={feature} className="py-2">
                      {displayNames[feature] || feature}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--arabica-brown)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Farm Selector Dropdown */}
            <div className="relative">
              <label className="block text-xs font-semibold text-[var(--espresso-black)] mb-2 uppercase tracking-wide">
                🌾 Select Farm
              </label>
              <div className="relative">
                <select
                  value={selectedFarm}
                  onChange={(e) => setSelectedFarm(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border-2 border-[var(--arabica-brown)] rounded-lg text-sm font-medium bg-white text-[var(--espresso-black)] hover:border-[#8B4513] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:ring-opacity-50 focus:border-[#8B4513] transition-all duration-200 appearance-none cursor-pointer shadow-sm"
                  style={{ backgroundImage: 'none' }}
                >
                  <option value="all" className="py-2 font-semibold">📍 All Farms</option>
                  {farmNames.filter(farm => farm !== 'all').map((farm) => (
                    <option key={farm} value={farm} className="py-2">
                      {farm}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--arabica-brown)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Charts */}
        {selectedFarm === 'all' ? (
          // Show three separate charts for all farms
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-64">
            {/* Mean Chart */}
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <h4 className="text-sm font-main font-semibold text-[var(--espresso-black)] mb-2">
                Mean {displayNames[selectedFeature]}
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData.mean} margin={{ top: 5, right: 5, left: 5, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="farm" 
                    stroke="#666"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={10}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--parchment)',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Median Chart (Dot Plot) */}
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <h4 className="text-sm font-main font-semibold text-[var(--espresso-black)] mb-2">
                Median {displayNames[selectedFeature]}
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={currentData.median} margin={{ top: 5, right: 5, left: 5, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="farm" 
                    stroke="#666"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={10}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--parchment)',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                  <Scatter dataKey="value" fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Mode Chart */}
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <h4 className="text-sm font-main font-semibold text-[var(--espresso-black)] mb-2">
                Mode {displayNames[selectedFeature]}
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData.mode} margin={{ top: 5, right: 5, left: 5, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="farm" 
                    stroke="#666"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={10}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--parchment)',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" fill="#ffc658" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          // Show single distribution chart for selected farm with statistics
          <div className="space-y-6">
            {/* Statistics Display using StatCards */}
            {statistics && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  label="Mean"
                  value={statistics.mean.toFixed(2)}
                />
                <StatCard
                  label="Median"
                  value={statistics.median.toFixed(2)}
                  
                />
                <StatCard
                  label="Mode"
                  value={statistics.mode.toFixed(2)}
                />
              </div>
            )}

            {/* Distribution Chart */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-base font-main font-semibold text-[var(--espresso-black)] mb-4">
                {displayNames[selectedFeature]} Distribution for {selectedFarm}
              </h4>
              {distributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={distributionData}
                    margin={{ top: 20, right: 30, bottom: 40, left: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="value"
                      label={{ 
                        value: `${displayNames[selectedFeature]} Value`, 
                        position: 'insideBottom', 
                        offset: -10,
                        style: { fontWeight: 600 }
                      }}
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis
                      label={{ 
                        value: 'Count', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fontWeight: 600 }
                      }}
                      stroke="#666"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--parchment)',
                        border: '2px solid var(--arabica-brown)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                      formatter={(value: number) => [value, 'Count']}
                      labelFormatter={(label: number) => `Value: ${label.toFixed(2)}`}
                    />
                    <Bar dataKey="count" fill="var(--arabica-brown)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center p-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-600 font-medium mb-2">No Distribution Data Available</p>
                    <p className="text-sm text-gray-500">
                      No raw data available for this farm and feature combination.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeanAnalyticsChart;