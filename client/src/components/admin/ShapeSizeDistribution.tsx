import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ShapeSizeData {
  size: string;
  Round: number;
  Teardrop: number;
}

interface ShapeSizeDistributionProps {
  data: {
    [farmName: string]: ShapeSizeData[];
  };
  farmNames: string[];
  thresholds?: {
    small_max: number;
    medium_min: number;
    medium_max: number;
    large_min: number;
  };
}

const ShapeSizeDistribution: React.FC<ShapeSizeDistributionProps> = ({ data, farmNames, thresholds }) => {
  const [selectedFarm, setSelectedFarm] = useState<string>('Overall');

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500">
        <p>No shape-size distribution data available</p>
      </div>
    );
  }

  const currentData = data[selectedFarm] || data['Overall'] || [];

  return (
    <div className="w-full h-full">
      {/* Farm Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Farm:
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedFarm('Overall')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors !border-2 ${
              selectedFarm === 'Overall'
                ? 'bg-[var(--arabica-brown)] text-white shadow-md border-[var(--arabica-brown)]'
                : '!bg-gray-100 !text-gray-700 !hover:bg-gray-200 !border-[var(--arabica-brown)]'
            }`}
          >
            Overall (All Farms)
          </button>
          {farmNames.map((farmName) => (
            <button
              key={farmName}
              onClick={() => setSelectedFarm(farmName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors !border-2 ${
                selectedFarm === farmName
                  ? 'bg-[var(--arabica-brown)] text-white shadow-md border-[var(--arabica-brown)]'
                  : '!bg-gray-100 !text-gray-700 !hover:bg-gray-200 !border-[var(--arabica-brown)]'
              }`}
            >
              {farmName}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={currentData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="size" 
            tick={{ fill: '#666', fontSize: 12 }}
            label={{ 
              value: 'Bean Size Category', 
              position: 'insideBottom', 
              offset: -10,
              style: { fill: '#333', fontWeight: 500 }
            }}
          />
          <YAxis 
            tick={{ fill: '#666', fontSize: 12 }}
            label={{ 
              value: 'Count', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#333', fontWeight: 500 }
            }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '12px'
            }}
            cursor={{ fill: 'rgba(161, 119, 63, 0.1)' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
          />
          <Bar 
            dataKey="Round" 
            fill="#4A90E2" 
            name="Round Beans"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="Teardrop" 
            fill="#a1773f" 
            name="Teardrop Beans"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      
      {thresholds && (
        <div className="mt-4 text-xs text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
          <div className="font-semibold mb-1 text-gray-700">Size Classification:</div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="font-medium">Small:</span> &lt; {thresholds.small_max.toFixed(1)} px²
            </div>
            <div>
              <span className="font-medium">Medium:</span> {thresholds.medium_min.toFixed(1)} - {thresholds.medium_max.toFixed(1)} px²
            </div>
            <div>
              <span className="font-medium">Large:</span> &gt; {thresholds.large_min.toFixed(1)} px²
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-300">
            <div className="font-semibold mb-1 text-gray-700">Shape Classification:</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-[#4A90E2]">Round:</span> Aspect Ratio &lt; 1.5, Eccentricity &lt; 0.8, Extent &gt; 0.75
              </div>
              <div>
                <span className="font-medium text-[#a1773f]">Teardrop:</span> All other bean shapes (more elongated)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShapeSizeDistribution;
