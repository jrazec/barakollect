import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis,BarChart,Bar } from 'recharts';

interface ScatterRatioRoundness {
  aspect_ratio: number;
  roundness: number;
}

interface ScatterRatioRoundnessChartProps {
  data: ScatterRatioRoundness[];
  data2: {value: number, count: number}[];
  data3: {value: number, count: number}[];
}

const ScatterRatioRoundnessChart: React.FC<ScatterRatioRoundnessChartProps> = ({ data, data2, data3 }) => {
  // Transform the data into an array suitable for the ScatterChart
  /*
scatter_ratio_roundess = list of objects
  [
    { aspect_ratio: number, roundness: number },
    ...
  ]
  */
  const chartData = data.map((item) => ({
    aspect_ratio: item.aspect_ratio,
    roundness: item.roundness,
    z: 1, // Fixed size for all points
  }));

  return (
    <div className='w-full grid grid-cols-1 gap-6'>
      <div className="w-full h-76 bg-white p-4 rounded-lg shadow-md">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 10, left: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="aspect_ratio"
              name="Aspect Ratio"
              label={{ value: 'Aspect Ratio', position: 'insideBottomRight', offset: -10 }}
              stroke="#666"
              fontSize={12}
            />
            <YAxis
              type="number"
              dataKey="roundness"
              name="Roundness"
              label={{ value: 'Roundness', angle: -90, position: 'insideLeft' }}
              stroke="#666"
              fontSize={12}
            />
            <ZAxis type="number" dataKey="z" range={[20, 20]} name="score" unit="km" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Beans" data={chartData} fill="#8884d8" fillOpacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-6 pb-4'>
        <div className="w-full h-76 bg-white p-4 rounded-lg shadow-md">
          <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data2}
          margin={{ top: 20, right: 20, bottom: 10, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="value"
            label={{ value: 'Aspect Ratio Bin', position: 'insideBottomRight', offset: -10 }}
            stroke="#666"
            fontSize={12}
          />
          <YAxis
            label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
            stroke="#666"
            fontSize={12}
          />
          <Tooltip />
          <Bar dataKey="count" fill="#82ca9d" />
        </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full h-76 bg-white p-4 rounded-lg shadow-md">
          <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data3}
          margin={{ top: 20, right: 20, bottom: 10, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="value"
            label={{ value: 'Roundness Bin', position: 'insideBottomRight', offset: -10 }}
            stroke="#666"
            fontSize={12}
          />
          <YAxis
            label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
            stroke="#666"
            fontSize={12}
          />
          <Tooltip />
          <Bar dataKey="count" fill="#ff7300" />
        </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default ScatterRatioRoundnessChart;