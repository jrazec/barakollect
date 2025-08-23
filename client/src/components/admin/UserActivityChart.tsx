import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { UserActivity } from '@/interfaces/global';

interface UserActivityChartProps {
  data: UserActivity[];
}

const UserActivityChart: React.FC<UserActivityChartProps> = ({ data }) => {
  const [selectedRoles, setSelectedRoles] = useState<('farmers' | 'researchers' | 'total')[]>(['total']);

  const toggleRole = (role: 'farmers' | 'researchers' | 'total') => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const colors = {
    farmers: '#82ca9d',
    researchers: '#8884d8',
    total: '#ffc658'
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => toggleRole('farmers')}
          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-accent transition-colors ${
            selectedRoles.includes('farmers')
              ? 'bg-[var(--arabica-brown)] text-[var(--parchment)]'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          Farmers
        </button>
        <button
          onClick={() => toggleRole('researchers')}
          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-accent transition-colors ${
            selectedRoles.includes('researchers')
              ? 'bg-[var(--arabica-brown)] text-[var(--parchment)]'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          Researchers
        </button>
        <button
          onClick={() => toggleRole('total')}
          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-accent transition-colors ${
            selectedRoles.includes('total')
              ? 'bg-[var(--arabica-brown)] text-[var(--parchment)]'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          Total
        </button>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
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
            <Legend />
            {selectedRoles.includes('farmers') && (
              <Line 
                type="monotone" 
                dataKey="farmers" 
                stroke={colors.farmers} 
                strokeWidth={2}
                name="Farmers"
              />
            )}
            {selectedRoles.includes('researchers') && (
              <Line 
                type="monotone" 
                dataKey="researchers" 
                stroke={colors.researchers} 
                strokeWidth={2}
                name="Researchers"
              />
            )}
            {selectedRoles.includes('total') && (
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke={colors.total} 
                strokeWidth={2}
                name="Total"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserActivityChart;
