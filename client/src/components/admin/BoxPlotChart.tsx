import React, { useMemo, useState } from 'react';
import { ResponsiveBoxPlot } from '@nivo/boxplot';

interface BoxPlotData {
  group: string;
  farms: string[];
  data: Array<{ farm: string; value: number }>;
}

interface BoxPlotChartProps {
  data: BoxPlotData[];
  yAxisLabel?: string;
}

interface ProcessedBoxData {
  group: string;
  mu: number;
  sd: number;
  n: number;
  min: number;
  max: number;
  q1: number;
  median: number;
  q3: number;
  outliers: number[];
  lowerBound: number;
  upperBound: number;
}

interface FarmProcessedData {
  farm: string;
  mu: number;
  sd: number;
  n: number;
  min: number;
  max: number;
  q1: number;
  median: number;
  q3: number;
  outliers: number[];
  lowerBound: number;
  upperBound: number;
}

const BoxPlotChart: React.FC<BoxPlotChartProps> = ({ data, yAxisLabel = 'Value' }) => {
  const [selectedFeature, setSelectedFeature] = useState<string>(data[0]?.group || '');

  // Calculate statistics for all features (overall)
  const allProcessedData = useMemo(() => {
    return data.map(item => {
      // Get all values across all farms for overall statistics
      const allValues = item.data.map(d => d.value);
      const sorted = [...allValues].sort((a, b) => a - b);
      const n = sorted.length;
      
      if (n === 0) {
        return null;
      }
      
      // Calculate quartiles
      const q1Index = Math.floor(n * 0.25);
      const medianIndex = Math.floor(n * 0.5);
      const q3Index = Math.floor(n * 0.75);
      
      const q1 = sorted[q1Index];
      const median = sorted[medianIndex];
      const q3 = sorted[q3Index];
      
      // Calculate IQR and outlier boundaries
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      
      // Find outliers
      const outliers = sorted.filter(val => val < lowerBound || val > upperBound);
      
      // Calculate mean and standard deviation
      const mean = sorted.reduce((sum, val) => sum + val, 0) / n;
      const variance = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      const sd = Math.sqrt(variance);
      
      return {
        group: item.group,
        mu: mean,
        sd: sd,
        n: n,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        q1: q1,
        median: median,
        q3: q3,
        outliers: outliers,
        lowerBound: lowerBound,
        upperBound: upperBound
      };
    }).filter((item): item is ProcessedBoxData => item !== null);
  }, [data]);

  // Calculate statistics per farm for the selected feature
  const farmProcessedData = useMemo(() => {
    const selectedFeatureData = data.find(item => item.group === selectedFeature);
    if (!selectedFeatureData) return [];

    // Group data by farm
    const farmGroups: { [farm: string]: number[] } = {};
    selectedFeatureData.data.forEach(({ farm, value }) => {
      if (!farmGroups[farm]) {
        farmGroups[farm] = [];
      }
      farmGroups[farm].push(value);
    });

    // Calculate statistics for each farm
    return Object.entries(farmGroups).map(([farm, values]) => {
      const sorted = [...values].sort((a, b) => a - b);
      const n = sorted.length;

      if (n === 0) return null;

      const q1Index = Math.floor(n * 0.25);
      const medianIndex = Math.floor(n * 0.5);
      const q3Index = Math.floor(n * 0.75);

      const q1 = sorted[q1Index];
      const median = sorted[medianIndex];
      const q3 = sorted[q3Index];

      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;

      const outliers = sorted.filter(val => val < lowerBound || val > upperBound);

      const mean = sorted.reduce((sum, val) => sum + val, 0) / n;
      const variance = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      const sd = Math.sqrt(variance);

      return {
        farm,
        mu: mean,
        sd: sd,
        n: n,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        q1: q1,
        median: median,
        q3: q3,
        outliers: outliers,
        lowerBound: lowerBound,
        upperBound: upperBound
      };
    }).filter((item): item is FarmProcessedData => item !== null);
  }, [data, selectedFeature]);

  const selectedData = allProcessedData.find(item => item.group === selectedFeature);
  const selectedFeatureData = data.find(item => item.group === selectedFeature);

  const nivoData = useMemo(() => {
    if (!selectedFeatureData || !selectedData) return [];
    
    const formattedData = selectedFeatureData.data.map(({ farm, value }) => ({
      group: farm,
      value: value
    }));
    
    return formattedData;
  }, [selectedFeature, selectedFeatureData, selectedData]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500">
        <p>No data available for boxplot</p>
      </div>
    );
  }

  if (!selectedData) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500">
        <p>No data available for selected feature</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Feature Filter/Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Feature to Analyze:
        </label>
        <div className="flex flex-wrap gap-2">
          {data.map((item) => (
            <button
              key={item.group}
              onClick={() => setSelectedFeature(item.group)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedFeature === item.group
                  ? 'bg-[var(--arabica-brown)] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.group}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 text-xs">
        <div className="bg-blue-50 rounded px-3 py-2 border border-blue-200">
          <div className="text-gray-600 font-medium">Total Sample Size</div>
          <div className="text-lg font-bold text-blue-700">{selectedData.n}</div>
          <div className="text-[10px] text-gray-500">Across all farms</div>
        </div>
        <div className="bg-green-50 rounded px-3 py-2 border border-green-200">
          <div className="text-gray-600 font-medium">Overall Mean</div>
          <div className="text-lg font-bold text-green-700">{selectedData.mu.toFixed(2)}</div>
          <div className="text-[10px] text-gray-500">All farms combined</div>
        </div>
        <div className="bg-purple-50 rounded px-3 py-2 border border-purple-200">
          <div className="text-gray-600 font-medium">Overall Median</div>
          <div className="text-lg font-bold text-purple-700">{selectedData.median.toFixed(2)}</div>
          <div className="text-[10px] text-gray-500">All farms combined</div>
        </div>
        <div className="bg-orange-50 rounded px-3 py-2 border border-orange-200">
          <div className="text-gray-600 font-medium">Overall Std Dev</div>
          <div className="text-lg font-bold text-orange-700">{selectedData.sd.toFixed(2)}</div>
          <div className="text-[10px] text-gray-500">All farms combined</div>
        </div>
        <div className={`rounded px-3 py-2 border ${
          selectedData.outliers.length > 0 
            ? 'bg-red-50 border-red-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="text-gray-600 font-medium">Total Outliers</div>
          <div className={`text-lg font-bold ${
            selectedData.outliers.length > 0 ? 'text-red-700' : 'text-gray-700'
          }`}>
            {selectedData.outliers.length}
          </div>
          <div className="text-[10px] text-gray-500">All farms combined</div>
        </div>
      </div>

      {/* Nivo Box Plot Visualization */}
      <div className="w-full h-[400px] mb-4">
        <ResponsiveBoxPlot
          data={nivoData}
          margin={{ top: 40, right: 60, bottom: 100, left: 80 }}
          minValue="auto"
          maxValue="auto"
          padding={0.12}
          innerPadding={3}
          enableGridX={false}
          enableGridY={true}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: selectedFeature,
            legendPosition: 'middle',
            legendOffset: 80
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: yAxisLabel,
            legendPosition: 'middle',
            legendOffset: -60
          }}
          colors={['#a1773f']}
          borderRadius={2}
          borderWidth={2}
          borderColor={{
            from: 'color',
            modifiers: [['darker', 0.3]]
          }}
          medianWidth={3}
          medianColor={{
            from: 'color',
            modifiers: [['darker', 0.3]]
          }}
          whiskerWidth={2}
          whiskerColor={{
            from: 'color',
            modifiers: [['darker', 0.3]]
          }}
          whiskerEndSize={0.6}
          motionConfig="gentle"
          tooltip={(props: any) => {
            const farmName = props.id || props.group;
            
            if (!farmName) {
              return null;
            }
            
            const farmData = farmProcessedData.find(f => f.farm === farmName);
            
            if (!farmData) {
              return null;
            }
            
            return (
              <div className="bg-white px-3 py-2 rounded shadow-lg border border-gray-200 text-xs">
                <div className="font-semibold text-[var(--espresso-black)] mb-2">
                  {selectedFeature} - {farmName}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Sample Size:</span>
                    <span className="font-medium text-blue-700">{farmData.n}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Min:</span>
                    <span className="font-medium">{farmData.min.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Q1:</span>
                    <span className="font-medium">{farmData.q1.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Median:</span>
                    <span className="font-medium text-[var(--arabica-brown)]">{farmData.median.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Q3:</span>
                    <span className="font-medium">{farmData.q3.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Max:</span>
                    <span className="font-medium">{farmData.max.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-1 mt-1">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Mean:</span>
                      <span className="font-medium">{farmData.mu.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Std Dev:</span>
                      <span className="font-medium">{farmData.sd.toFixed(2)}</span>
                    </div>
                    {farmData.outliers.length > 0 && (
                      <div className="flex justify-between gap-4 text-red-600 mt-1">
                        <span>Outliers:</span>
                        <span className="font-bold">{farmData.outliers.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* Detailed Statistics Table */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-2">Overall Quartile Summary</h4>
          <p className="text-[10px] text-gray-500 mb-2">Combined data across all farms</p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Maximum:</span>
              <span className="font-medium">{selectedData.max.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Q3 (75th percentile):</span>
              <span className="font-medium">{selectedData.q3.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-300 pt-1">
              <span className="text-gray-600">Median (50th):</span>
              <span className="font-medium text-[var(--arabica-brown)]">{selectedData.median.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-300 pt-1">
              <span className="text-gray-600">Q1 (25th percentile):</span>
              <span className="font-medium">{selectedData.q1.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Minimum:</span>
              <span className="font-medium">{selectedData.min.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-2">Overall Outlier Analysis</h4>
          <p className="text-[10px] text-gray-500 mb-2">Combined data across all farms</p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">IQR (Q3-Q1):</span>
              <span className="font-medium">{(selectedData.q3 - selectedData.q1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lower Bound:</span>
              <span className="font-medium">{selectedData.lowerBound.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Upper Bound:</span>
              <span className="font-medium">{selectedData.upperBound.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-300 pt-1">
              <span className="text-gray-600">Total Outliers:</span>
              <span className={`font-bold ${selectedData.outliers.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {selectedData.outliers.length}
              </span>
            </div>
            {selectedData.outliers.length > 0 && (
              <>
                <div className="flex justify-between text-red-600">
                  <span>Outlier %:</span>
                  <span className="font-medium">
                    {((selectedData.outliers.length / selectedData.n) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <div className="text-gray-600 mb-1">Outlier Values:</div>
                  <div className="max-h-20 overflow-y-auto text-red-600 font-mono text-[10px]">
                    {selectedData.outliers.slice(0, 10).map((val, idx) => (
                      <div key={idx}>{val.toFixed(2)}</div>
                    ))}
                    {selectedData.outliers.length > 10 && (
                      <div className="text-gray-500 italic">
                        ... and {selectedData.outliers.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoxPlotChart;
