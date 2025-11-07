import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface FarmData {
  [farmId: string]: {
    pending: number;
    validated: number;
  };
}

interface TopUploader {
  user_id: number;
  name: string;
  upload_count: number;
}

interface BeanTypeData {
  [beanType: string]: number;
}

interface UploadStatisticsChartProps {
  farmData: FarmData;
  topUploaderData: TopUploader[];
  beanTypeData: BeanTypeData;
}

const UploadStatisticsChart: React.FC<UploadStatisticsChartProps> = ({ 
  farmData, 
  topUploaderData, 
  beanTypeData 
}) => {
  const [activeSection, setActiveSection] = useState<'farms' | 'uploaders' | 'beantypes'>('farms');

  // Process farm data for stacked bar chart
  const processFarmData = () => {
    return Object.entries(farmData).map(([farmId, data]) => ({
      farm: `Farm ${farmId}`,
      farmId,
      pending: data.pending,
      validated: data.validated,
      total: data.pending + data.validated
    }));
  };

  // Process bean type data for pie chart
  const processBeanTypeData = () => {
    return Object.entries(beanTypeData).map(([type, count]) => ({
      name: type,
      value: count
    }));
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

  const farmChartData = processFarmData();
  const pieChartData = processBeanTypeData();

  return (
    <div className="h-full flex flex-col">
      {/* Section Toggle Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setActiveSection('farms')}
          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-accent transition-colors ${
            activeSection === 'farms'
              ? 'bg-[var(--arabica-brown)] text-[var(--parchment)]'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          Farm Statistics
        </button>
        <button
          onClick={() => setActiveSection('uploaders')}
          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-accent transition-colors ${
            activeSection === 'uploaders'
              ? 'bg-[var(--arabica-brown)] text-[var(--parchment)]'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          Top Uploaders
        </button>
        <button
          onClick={() => setActiveSection('beantypes')}
          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-accent transition-colors ${
            activeSection === 'beantypes'
              ? 'bg-[var(--arabica-brown)] text-[var(--parchment)]'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          Bean Types
        </button>
      </div>
      
      <div className="flex-1 min-h-0">
        {activeSection === 'farms' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={farmChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="farm" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--parchment)',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="pending" stackId="a" fill="#ff7300" name="Pending" radius={[0, 0, 0, 0]} />
              <Bar dataKey="validated" stackId="a" fill="#82ca9d" name="Validated" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeSection === 'uploaders' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topUploaderData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                stroke="#666"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--parchment)',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="upload_count" fill="#8884d8" name="Uploads" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeSection === 'beantypes' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--parchment)',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default UploadStatisticsChart;