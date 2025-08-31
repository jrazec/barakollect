import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { BeanSubmission } from '@/interfaces/global';

interface BeanSubmissionsChartProps {
  data: BeanSubmission[];
}

const BeanSubmissionsChart: React.FC<BeanSubmissionsChartProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [selectedRole, setSelectedRole] = useState<'all' | 'farmer' | 'researcher'>('all');

  // Process data for different views
  const processData = () => {
    if (selectedRole === 'all') {
      return data;
    }
    return data.filter(item => 
      selectedRole === 'farmer' ? item.farmerName : true
    );
  };

  // Group by status for pie chart
  const getStatusData = () => {
    const statusCount = data.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  };

  // Group by bean type for bar chart
  const getBeanTypeData = () => {
    const typeCount = data.reduce((acc, item) => {
      acc[item.beanType] = (acc[item.beanType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCount).map(([type, count]) => ({
      name: type,
      submissions: count
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const processedData = processData();
  const statusData = getStatusData();
  const beanTypeData = getBeanTypeData();

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setChartType('bar')}
          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-accent transition-colors ${
            chartType === 'bar'
              ? 'bg-[var(--arabica-brown)] text-[var(--parchment)]'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          Bar Chart
        </button>
        <button
          onClick={() => setChartType('pie')}
          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-accent transition-colors ${
            chartType === 'pie'
              ? 'bg-[var(--arabica-brown)] text-[var(--parchment)]'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          Pie Chart
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedRole('all')}
          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-accent transition-colors ${
            selectedRole === 'all'
              ? 'bg-[var(--arabica-brown)] text-[var(--parchment)]'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedRole('farmer')}
          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-accent transition-colors ${
            selectedRole === 'farmer'
              ? 'bg-[var(--arabica-brown)] text-[var(--parchment)]'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          Farmers
        </button>
        <button
          onClick={() => setSelectedRole('researcher')}
          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-accent transition-colors ${
            selectedRole === 'researcher'
              ? 'bg-[var(--arabica-brown)] text-[var(--parchment)]'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          Researchers
        </button>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={beanTypeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
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
              <Bar dataKey="submissions" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
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
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BeanSubmissionsChart;
