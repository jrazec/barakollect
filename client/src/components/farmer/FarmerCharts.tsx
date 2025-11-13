import React, { useState } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    ScatterChart,
    Scatter,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell,
    PieChart,
    Pie
} from 'recharts';

// Color palette matching the app theme
const COLORS = {
    farmer: '#8B4513', // arabica-brown
    global: '#D2B48C', // mocha-beige
    primary: '#4A2511', // espresso-black (lighter)
    accent: '#F5E6D3', // parchment
    highlight: '#CD853F' // peru
};

interface BeanSizeDistributionProps {
    data: Array<{
        category: string;
        farmer: number;
        global: number;
    }>;
    thresholds?: {
        small_max: number;
        medium_min: number;
        medium_max: number;
        large_min: number;
        min_length: number;
        max_length: number;
        median_length: number;
    } | null;
}

// Custom tooltip for pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const farmerCount = data.farmer;
        const globalCount = data.global;
        const farmerPercent = data.percentage;
        
        // Calculate global percentage
        const totalGlobal = payload[0].payload.totalGlobal || 1;
        const globalPercent = ((globalCount / totalGlobal) * 100).toFixed(1);
        
        // Calculate difference
        const diff = (parseFloat(farmerPercent) - parseFloat(globalPercent)).toFixed(1);
        const diffSign = Number(diff) > 0 ? '+' : '';
        
        return (
            <div className="bg-[#F5E6D3] border border-[#8B4513] rounded-lg p-3 shadow-lg">
                <p className="font-bold text-[#4A2511] mb-2">{data.category}</p>
                <div className="space-y-1">
                    <p className="text-sm text-[#8B4513]">
                        <span className="font-semibold">Your Farm:</span> {farmerCount} beans ({farmerPercent}%)
                    </p>
                    <p className="text-sm text-[#A0522D]">
                        <span className="font-semibold">All Farms:</span> {globalCount} beans ({globalPercent}%)
                    </p>
                    <div className="pt-2 border-t border-[#D2B48C]">
                        <p className={`text-sm font-semibold ${Number(diff) > 0 ? 'text-green-700' : Number(diff) < 0 ? 'text-red-700' : 'text-gray-700'}`}>
                            Difference: {diffSign}{diff}%
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export const BeanSizeDistribution: React.FC<BeanSizeDistributionProps> = ({ data, thresholds }) => {
    // Prepare data for pie chart (only farmer's data)
    const pieData = data.map(item => {
        const total = data.reduce((sum, d) => sum + d.farmer, 0);
        const totalGlobal = data.reduce((sum, d) => sum + d.global, 0);
        return {
            category: item.category,
            farmer: item.farmer,
            global: item.global,
            percentage: ((item.farmer / total) * 100).toFixed(1),
            totalGlobal: totalGlobal
        };
    });

    // Colors for each category
    const CATEGORY_COLORS = {
        'Small': '#D2B48C',  // mocha-beige (lighter)
        'Medium': '#CD853F', // peru (medium)
        'Large': '#8B4513'   // arabica-brown (darker)
    };

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percentage }) => `${category}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="farmer"
                    >
                        {pieData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS] || COLORS.farmer}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    
                </PieChart>
            </ResponsiveContainer>
            
            {/* Summary comparison */}
            
            {thresholds && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-900 font-semibold mb-1">📏 Dynamic Size Categories (based on all beans in database):</p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-amber-800">
                        <div>
                            <span className="font-medium">Small:</span> &lt; {thresholds.small_max}mm
                        </div>
                        <div>
                            <span className="font-medium">Medium:</span> {thresholds.medium_min}-{thresholds.medium_max}mm
                        </div>
                        <div>
                            <span className="font-medium">Large:</span> &gt; {thresholds.large_min}mm
                        </div>
                    </div>
                    <p className="text-xs text-amber-700 mt-2">
                        Range: {thresholds.min_length}mm (min) → {thresholds.median_length}mm (median) → {thresholds.max_length}mm (max)
                    </p>
                </div>
            )}
        </div>
    );
};

interface QualityConsistencyProps {
    data: Array<{
        date: string;
        aspect_ratio: number;
        solidity: number;
        bean_count: number;
    }>;
}

export const QualityConsistency: React.FC<QualityConsistencyProps> = ({ data }) => {
    const [selectedMetric, setSelectedMetric] = useState<'aspect_ratio' | 'solidity'>('aspect_ratio');
    
    // Reverse data to show chronological order (oldest to newest)
    const chartData = [...data].reverse();

    return (
        <div className="w-full">
            <div className="flex justify-center gap-2 mb-4">
                <button
                    onClick={() => setSelectedMetric('aspect_ratio')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedMetric === 'aspect_ratio'
                            ? 'bg-[var(--arabica-brown)] text-[var(--parchment)]'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Aspect Ratio
                </button>
                <button
                    onClick={() => setSelectedMetric('solidity')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedMetric === 'solidity'
                            ? 'bg-[var(--arabica-brown)] text-[var(--parchment)]'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Solidity (Density)
                </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#4A2511', fontSize: 10 }}
                        label={{ value: 'Upload Date', position: 'insideBottom', offset: -5, fill: '#4A2511' }}
                    />
                    <YAxis 
                        tick={{ fill: '#4A2511', fontSize: 12 }}
                        label={{ 
                            value: selectedMetric === 'aspect_ratio' ? 'Aspect Ratio' : 'Solidity', 
                            angle: -90, 
                            position: 'insideLeft', 
                            fill: '#4A2511' 
                        }}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#F5E6D3', 
                            border: '1px solid #8B4513',
                            borderRadius: '8px'
                        }}
                        labelFormatter={(value) => `Date: ${value}`}
                    />
                    <Line 
                        type="monotone" 
                        dataKey={selectedMetric} 
                        stroke={COLORS.farmer} 
                        strokeWidth={2}
                        dot={{ fill: COLORS.farmer, r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

interface YieldQualityProps {
    data: Array<{
        image_id: number;
        date: string;
        yield: number;
        avg_area: number;
        avg_solidity: number;
    }>;
}

export const YieldQualityScatter: React.FC<YieldQualityProps> = ({ data }) => {
    const [yMetric, setYMetric] = useState<'avg_area' | 'avg_solidity'>('avg_area');

    return (
        <div className="w-full">
            <div className="flex justify-center gap-2 mb-4">
                <button
                    onClick={() => setYMetric('avg_area')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        yMetric === 'avg_area'
                            ? 'bg-[var(--arabica-brown)] text-[var(--parchment)]'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Bean Size (Area)
                </button>
                <button
                    onClick={() => setYMetric('avg_solidity')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        yMetric === 'avg_solidity'
                            ? 'bg-[var(--arabica-brown)] text-[var(--parchment)]'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Bean Density
                </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                        dataKey="yield" 
                        type="number" 
                        name="Yield"
                        tick={{ fill: '#4A2511', fontSize: 12 }}
                        label={{ value: 'Yield (beans detected)', position: 'insideBottom', offset: -10, fill: '#4A2511' }}
                    />
                    <YAxis 
                        dataKey={yMetric} 
                        type="number" 
                        name={yMetric === 'avg_area' ? 'Avg Area' : 'Avg Solidity'}
                        tick={{ fill: '#4A2511', fontSize: 12 }}
                        label={{ 
                            value: yMetric === 'avg_area' ? 'Average Bean Area (mm²)' : 'Average Solidity', 
                            angle: -90, 
                            position: 'insideLeft', 
                            fill: '#4A2511' 
                        }}
                    />
                    <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ 
                            backgroundColor: '#F5E6D3', 
                            border: '1px solid #8B4513',
                            borderRadius: '8px'
                        }}
                        formatter={(value: any) => [typeof value === 'number' ? value.toFixed(2) : value, '']}
                        labelFormatter={(_value, payload) => {
                            if (payload && payload.length > 0) {
                                return `Date: ${payload[0].payload.date}`;
                            }
                            return '';
                        }}
                    />
                    <Scatter data={data} fill={COLORS.farmer}>
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS.farmer} />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-600 text-center mt-2">
                💡 Tip: Higher yield with higher quality (top-right) is the ideal balance!
            </p>
        </div>
    );
};

interface FarmComparisonProps {
    data: {
        farmer: {
            length: number;
            width: number;
            solidity: number;
            aspect_ratio: number;
            eccentricity: number;
        };
        province: {
            length: number;
            width: number;
            solidity: number;
            aspect_ratio: number;
            eccentricity: number;
        };
        top_farms: Array<{
            farm_id: number;
            farm_name: string;
            avg_length: number;
            avg_width: number;
            avg_solidity: number;
            avg_area: number;
            bean_count: number;
        }>;
    };
}

export const FarmComparison: React.FC<FarmComparisonProps> = ({ data }) => {
    const [selectedMetric, setSelectedMetric] = useState<'avg_area' | 'avg_solidity' | 'avg_length' | 'avg_width'>('avg_area');

    // Get the current user's farm ID from data.farmer
    const currentFarmId = data.top_farms.find(farm => 
        Math.abs(farm.avg_length - data.farmer.length) < 0.1 &&
        Math.abs(farm.avg_width - data.farmer.width) < 0.1
    )?.farm_id;

    // Prepare chart data - sort by selected metric
    const chartData = [...data.top_farms]
        .sort((a, b) => b[selectedMetric] - a[selectedMetric])
        .map(farm => ({
            farm_name: farm.farm_name,
            value: farm[selectedMetric],
            isCurrentFarm: farm.farm_id === currentFarmId,
            bean_count: farm.bean_count
        }));

    // Metric labels
    const metricLabels: Record<typeof selectedMetric, string> = {
        avg_area: 'Average Bean Area (mm²)',
        avg_solidity: 'Average Solidity',
        avg_length: 'Average Length (mm)',
        avg_width: 'Average Width (mm)'
    };

    return (
        <div className="w-full">
            {/* Metric Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
            <button
                onClick={() => setSelectedMetric('avg_area')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors !border-2 ${
                selectedMetric === 'avg_area'
                    ? 'bg-[var(--arabica-brown)] text-white shadow-md !border-[var(--arabica-brown)]'
                    : 'button-secondary'
                }`}
            >
                Area
            </button>
            <button
                onClick={() => setSelectedMetric('avg_solidity')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors !border-2 ${
                selectedMetric === 'avg_solidity'
                    ? 'bg-[var(--arabica-brown)] text-white shadow-md !border-[var(--arabica-brown)]'
                    : 'button-secondary'
                }`}
            >
                Solidity
            </button>
            <button
                onClick={() => setSelectedMetric('avg_length')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors !border-2 ${
                selectedMetric === 'avg_length'
                    ? 'bg-[var(--arabica-brown)] text-white shadow-md !border-[var(--arabica-brown)]'
                    : 'button-secondary'
                }`}
            >
                Length
            </button>
            <button
                onClick={() => setSelectedMetric('avg_width')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors !border-2 ${
                selectedMetric === 'avg_width'
                    ? 'bg-[var(--arabica-brown)] text-white shadow-md !border-[var(--arabica-brown)]'
                    : 'button-secondary'
                }`}
            >
                Width
            </button>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                    data={chartData} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                        type="number"
                        tick={{ fill: '#4A2511', fontSize: 11 }}
                    />
                    <YAxis 
                        type="category"
                        dataKey="farm_name"
                        tick={{ fill: '#4A2511', fontSize: 11 }}
                        width={90}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#F5E6D3', 
                            border: '1px solid #8B4513',
                            borderRadius: '8px'
                        }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-[#F5E6D3] border border-[#8B4513] rounded-lg p-3 shadow-lg">
                                        <p className="font-bold text-[#4A2511]">
                                            {data.farm_name}
                                            {data.isCurrentFarm && ' (Your Farm)'}
                                        </p>
                                        <p className="text-sm text-[#8B4513]">
                                            {metricLabels[selectedMetric]}: {data.value.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Total beans: {data.bean_count}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar 
                        dataKey="value"
                        fill={COLORS.farmer}
                        radius={[0, 8, 8, 0]}
                    >
                        {chartData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.isCurrentFarm ? COLORS.farmer : COLORS.global}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

interface ImprovementTrendsProps {
    data: Array<{
        date: string;
        length: number;
        width: number;
        solidity: number;
        area: number;
    }>;
}

export const ImprovementTrends: React.FC<ImprovementTrendsProps> = ({ data }) => {
    const [selectedMetrics, setSelectedMetrics] = useState<{
        length: boolean;
        width: boolean;
        solidity: boolean;
        area: boolean;
    }>({
        length: true,
        width: true,
        solidity: false,
        area: false
    });

    const toggleMetric = (metric: keyof typeof selectedMetrics) => {
        setSelectedMetrics(prev => ({
            ...prev,
            [metric]: !prev[metric]
        }));
    };

    // Normalize data for better visualization
    const normalizeData = () => {
        if (data.length === 0) return [];

        const metrics = ['length', 'width', 'solidity', 'area'] as const;
        const maxValues = {} as Record<typeof metrics[number], number>;
        
        metrics.forEach(metric => {
            maxValues[metric] = Math.max(...data.map(d => d[metric]));
        });

        return data.map(item => ({
            date: item.date,
            length: (item.length / maxValues.length) * 100,
            width: (item.width / maxValues.width) * 100,
            solidity: (item.solidity / maxValues.solidity) * 100,
            area: (item.area / maxValues.area) * 100,
            raw: item
        }));
    };

    const normalizedData = normalizeData();

    return (
        <div className="w-full">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
                <button
                    onClick={() => toggleMetric('length')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedMetrics.length
                            ? 'bg-[#8B4513] text-[var(--parchment)]'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Length
                </button>
                <button
                    onClick={() => toggleMetric('width')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedMetrics.width
                            ? 'bg-[#CD853F] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Width
                </button>
                <button
                    onClick={() => toggleMetric('solidity')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedMetrics.solidity
                            ? 'bg-[#D2691E] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Solidity
                </button>
                <button
                    onClick={() => toggleMetric('area')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedMetrics.area
                            ? 'bg-[#A0522D] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Area
                </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={normalizedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#4A2511', fontSize: 10 }}
                        label={{ value: 'Upload Date', position: 'insideBottom', offset: -5, fill: '#4A2511' }}
                    />
                    <YAxis 
                        tick={{ fill: '#4A2511', fontSize: 12 }}
                        label={{ value: 'Normalized Value (%)', angle: -90, position: 'insideLeft', fill: '#4A2511' }}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#F5E6D3', 
                            border: '1px solid #8B4513',
                            borderRadius: '8px'
                        }}
                        labelFormatter={(value) => `Date: ${value}`}
                        formatter={(value: any, name: string, props: any) => {
                            const raw = props.payload.raw;
                            if (name === 'length') return [`${raw.length.toFixed(2)} mm`, 'Length'];
                            if (name === 'width') return [`${raw.width.toFixed(2)} mm`, 'Width'];
                            if (name === 'solidity') return [`${raw.solidity.toFixed(3)}`, 'Solidity'];
                            if (name === 'area') return [`${raw.area.toFixed(2)} mm²`, 'Area'];
                            return [value, name];
                        }}
                    />
                    <Legend 
                        wrapperStyle={{ paddingTop: '10px' }}
                    />
                    {selectedMetrics.length && (
                        <Line 
                            type="monotone" 
                            dataKey="length" 
                            stroke="#8B4513" 
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name="Length"
                        />
                    )}
                    {selectedMetrics.width && (
                        <Line 
                            type="monotone" 
                            dataKey="width" 
                            stroke="#CD853F" 
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name="Width"
                        />
                    )}
                    {selectedMetrics.solidity && (
                        <Line 
                            type="monotone" 
                            dataKey="solidity" 
                            stroke="#D2691E" 
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name="Solidity"
                        />
                    )}
                    {selectedMetrics.area && (
                        <Line 
                            type="monotone" 
                            dataKey="area" 
                            stroke="#A0522D" 
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name="Area"
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-600 text-center mt-2">
                💡 Track your progress over time - upward trends mean improvement!
            </p>
        </div>
    );
};
