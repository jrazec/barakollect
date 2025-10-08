
import {  PieChart,Area, Tooltip, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, LineChart, Line, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
const data = [
  { name: 'Page A', uv: 1000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 5300, pv: 2400, amt: 2400 },
  { name: 'Page C', uv: 500, pv: 2400, amt: 2400 },
  { name: 'Page D', uv: 6600, pv: 2400, amt: 2400 },
  { name: 'Page E', uv: 345, pv: 2400, amt: 2400 },
  { name: 'Page F', uv: 4030, pv: 2400, amt: 2400 }

];

const TempChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}
      margin={{ top: 1, right: 0, left: -5, bottom: 0 }}>
      <XAxis dataKey="name" />
      <YAxis />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
    
      <Area type="monotone" dataKey="uv" stroke="#8884d8" fill="#8884d8" />
    </AreaChart>
  </ResponsiveContainer>
);
const PieChartComponent = () => (
    <ResponsiveContainer width="100%" height="100%">
        <PieChart data={data}>
            <Pie dataKey="uv" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" />
            <Tooltip />
        </PieChart>
    </ResponsiveContainer>
);

const LineChartComponent = () => (
    <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 1, right: 0, left: -5, bottom: 0 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Line type="monotone" dataKey="uv" stroke="#8884d8" />
        </LineChart>
    </ResponsiveContainer>
);

const BarChartComponent = () => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 1, right: 0, left: -5, bottom: 0 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Bar dataKey="uv" fill="#8884d8" />
        </BarChart>
    </ResponsiveContainer>
);

const ScatterChartComponent = () => (
    <ResponsiveContainer width="100%" height="100%">
        <ScatterChart data={data} margin={{ top: 1, right: 0, left: -5, bottom: 0 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Scatter dataKey="uv" fill="#8884d8" />
        </ScatterChart>
    </ResponsiveContainer>
);

const CorrelationGrid = () => (
    <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 1, right: 0, left: -5, bottom: 0 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area type="monotone" dataKey="uv" stroke="#82ca9d" fill="#82ca9d" />
            <Area type="monotone" dataKey="pv" stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
    </ResponsiveContainer>
);

export { TempChart, PieChartComponent, LineChartComponent, BarChartComponent, ScatterChartComponent, CorrelationGrid };