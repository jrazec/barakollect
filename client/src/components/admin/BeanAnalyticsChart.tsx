import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import StatCard from '@/components/StatCard';

interface FeatureStats {
  [featureName: string]: {
    mean: Array<{ farm: string; value: number }>;
    median: Array<{ farm: string; value: number }>;
    mode: Array<{ farm: string; value: number }>;
  };
}

interface BeanAnalyticsChartProps {
  totalPredictions: number;
  avgConfidence: number;
  minConfidence: number;
  maxConfidence: number;
  featureStats: FeatureStats;
}

const BeanAnalyticsChart: React.FC<BeanAnalyticsChartProps> = ({
  totalPredictions,
  avgConfidence,
  minConfidence,
  maxConfidence,
  featureStats
}) => {
  const [selectedFeature, setSelectedFeature] = useState<string>('area');

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

  const getCurrentFeatureData = () => {
    if (!featureStats[selectedFeature]) return { mean: [], median: [], mode: [] };
    return featureStats[selectedFeature];
  };

  const currentData = getCurrentFeatureData();

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
      <div className="bg-[var(--parchment)] rounded-lg shadow p-4">
        <div className="mb-4">
          <h3 className="text-lg font-main font-bold text-[var(--espresso-black)] mb-2">
            Feature Analysis by Farm
          </h3>
          <p className="text-sm font-accent text-gray-600 mb-4">
            Select a feature to view mean, median, and mode statistics across farms
          </p>
          
          {/* Feature Selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {featureNames.map((feature) => (
              <button
          key={feature}
          onClick={() => setSelectedFeature(feature)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors !border-2 ${
            selectedFeature === feature
              ? 'bg-[var(--arabica-brown)] text-white shadow-md border-[var(--arabica-brown)]'
              : '!bg-gray-100 !text-gray-700 !hover:bg-gray-200 !border-[var(--arabica-brown)]'
          }`}
              >
          {displayNames[feature] || feature}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-64">
          {/* Mean Chart */}
          <div className="bg-white rounded-lg p-3">
            <h4 className="text-sm font-main font-semibold text-[var(--espresso-black)] mb-2">
              Mean {displayNames[selectedFeature]}
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData.mean} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="farm" 
                  stroke="#666"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={40}
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
                <Bar dataKey="value" fill="#82ca9d" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Median Chart (Dot Plot) */}
          <div className="bg-white rounded-lg p-3">
            <h4 className="text-sm font-main font-semibold text-[var(--espresso-black)] mb-2">
              Median {displayNames[selectedFeature]}
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={currentData.median} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="farm" 
                  stroke="#666"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={40}
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
          <div className="bg-white rounded-lg p-3">
            <h4 className="text-sm font-main font-semibold text-[var(--espresso-black)] mb-2">
              Mode {displayNames[selectedFeature]}
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData.mode} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="farm" 
                  stroke="#666"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={40}
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
                <Bar dataKey="value" fill="#ffc658" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeanAnalyticsChart;