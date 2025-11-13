import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { HorizontalBarChartComponent } from '@/components/ChartComponent';

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

const BROWN_BAR_COLORS = {
  pending: '#C58F63',
  validated: '#8C4A2F'
} as const;

const PIE_COLORS = ['#8C4A2F', '#A1653A', '#BA7E4C', '#D19962', '#E6B67B', '#F0CE9A'];

const UploadStatisticsChart: React.FC<UploadStatisticsChartProps> = ({
  farmData,
  topUploaderData,
  beanTypeData
}) => {
  const farmChartData = useMemo(
    () =>
      Object.entries(farmData).map(([farmId, data]) => ({
        farm: `Farm ${farmId}`,
        farmId,
        pending: data.pending,
        validated: data.validated,
        total: data.pending + data.validated
      })),
    [farmData]
  );

  const topUploaderChartData = useMemo(
    () =>
      [...topUploaderData]
        .sort((a, b) => b.upload_count - a.upload_count)
        .map((item) => ({ name: item.name, uv: item.upload_count })),
    [topUploaderData]
  );

  const pieChartData = useMemo(
    () =>
      Object.entries(beanTypeData).map(([type, count]) => ({
        name: type,
        value: count
      })),
    [beanTypeData]
  );

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="text-sm font-semibold text-[var(--espresso-black)]">Farm Validation Overview</div>
          <div className="h-64">
            {farmChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={farmChartData} margin={{ top: 10, right: 16, left: 4, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3e7dc" />
                  <XAxis dataKey="farm" stroke="#5B3B2C" fontSize={12} tickLine={false} />
                  <YAxis stroke="#5B3B2C" fontSize={12} tickLine={false} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--parchment)',
                      border: '1px solid rgba(92, 59, 44, 0.15)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="pending" stackId="uploads" fill={BROWN_BAR_COLORS.pending} radius={[0, 0, 0, 0]} name="Pending" />
                  <Bar dataKey="validated" stackId="uploads" fill={BROWN_BAR_COLORS.validated} radius={[6, 6, 0, 0]} name="Validated" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">No farm upload data available.</div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-sm font-semibold text-[var(--espresso-black)]">Top Uploaders</div>
          <div className="h-64">
            {topUploaderChartData.length > 0 ? (
              <HorizontalBarChartComponent
                data={topUploaderChartData}
                barColor="#A1653A"
                gridColor="#f3e7dc"
                axisColor="#5B3B2C"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">No uploader data available.</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="text-sm font-semibold text-[var(--espresso-black)]">Bean Type Distribution</div>
        <div className="h-64">
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}`, 'Uploads']}
                  contentStyle={{
                    backgroundColor: 'var(--parchment)',
                    border: '1px solid rgba(92, 59, 44, 0.15)',
                    borderRadius: '8px'
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="circle"
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-500">No bean type data available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadStatisticsChart;