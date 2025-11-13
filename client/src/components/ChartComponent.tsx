
import { PieChart, Area, Tooltip, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, LineChart, Line, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
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
const PieChartComponent = ({ data }: { data: { name: string; uv: number; }[] }) => (
    <ResponsiveContainer width="100%" height="100%">
        <PieChart data={data}>
            <Pie dataKey="uv" cx="50%" cy="50%" innerRadius={60} outerRadius={120} fill="#8884d8" />
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

const LinearProgressBar = ({ data }: { data: { total_size: number, size: string } }) => {
    // Size is expected to be in MB, convert to number with this format "n MB"
    const sizeInMB = parseFloat(data.size.replace(" MB", ""));
    console.log('sizeInMB:', sizeInMB);
    const percentage = data.total_size === 0 ? 0 : (sizeInMB / data.total_size) * 100;
    return (
        <div className='h-[4rem] w-full flex flex-col justify-center space-y-2 align-center'>
            <div className="w-full bg-[var(--white)] rounded-full h-2.5">
                <div
                    className={`h-2.5 rounded-full transition-all duration-300 ease-in-out ${percentage < 70 ? 'bg-green-500' :
                        percentage < 90 ? 'bg-yellow-500' :
                            'bg-red-500'
                        }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
                <div className="mt-1 text-sm text-[var(--brown)] font-accent">
                    {data.size} / {data.total_size} MB ({percentage.toFixed(1)}%)
                </div>
            </div>
        </div>
    );
}

interface HorizontalBarChartProps {
    data: { name: string; uv: number; }[];
    barColor?: string;
    gridColor?: string;
    axisColor?: string;
}

const HorizontalBarChartComponent = ({
    data,
    barColor = '#8C4A2F',
    gridColor = '#f0f0f0',
    axisColor = '#666666'
}: HorizontalBarChartProps) => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart
            layout="vertical"
            data={[...data].sort((a, b) => b.uv - a.uv)}
            margin={{ top: 8, right: 16, left: 16, bottom: 8 }}
        >
            <XAxis type="number" stroke={axisColor} tickLine={false} fontSize={12} />
            <YAxis type="category" dataKey="name" stroke={axisColor} tickLine={false} fontSize={12} width={120} />
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <Tooltip
                contentStyle={{
                    backgroundColor: 'var(--parchment)',
                    border: '1px solid rgba(92, 59, 44, 0.15)',
                    borderRadius: '8px'
                }}
            />
            <Bar dataKey="uv" fill={barColor} radius={[6, 6, 6, 6]} />
        </BarChart>
    </ResponsiveContainer>
);

export { TempChart, PieChartComponent, LineChartComponent, BarChartComponent, ScatterChartComponent, CorrelationGrid, LinearProgressBar, HorizontalBarChartComponent };