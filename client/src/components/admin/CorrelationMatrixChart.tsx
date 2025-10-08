import React from 'react';
import { ResponsiveHeatMap } from '@nivo/heatmap';

interface CorrelationData {
  id: string;
  data: Array<{
    x: string;
    y: number;
  }>;
}

interface CorrelationMatrixChartProps {
  data: CorrelationData[];
}

const CorrelationMatrixChart: React.FC<CorrelationMatrixChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 font-accent">No correlation data available</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveHeatMap
        data={data}
        margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
        valueFormat=">-.2f"
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: '',
          legendOffset: 36,
          truncateTickAt: 0
        }}
        axisRight={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Feature',
          legendPosition: 'middle',
          legendOffset: 70,
          truncateTickAt: 0
        }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: 'Feature',
          legendPosition: 'middle',
          legendOffset: 36,
          truncateTickAt: 0
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: '',
          legendPosition: 'middle',
          legendOffset: -40,
          truncateTickAt: 0
        }}
        colors={{
          type: 'diverging',
          scheme: 'red_yellow_blue',
          divergeAt: 0,
          minValue: -1,
          maxValue: 1
        }}
        emptyColor="#555555"
        legends={[
          {
            anchor: 'bottom',
            translateX: 0,
            translateY: 30,
            length: 400,
            thickness: 8,
            direction: 'row',
            tickPosition: 'after',
            tickSize: 3,
            tickSpacing: 4,
            tickOverlap: false,
            titleAlign: 'start',
            titleOffset: 4
          }
        ]}
        annotations={[]}
        hoverTarget="cell"
        tooltip={({ cell }) => (
          <div
            style={{
              background: 'var(--parchment)',
              padding: '9px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <strong>
              {cell.serieId} vs {cell.data.x}
            </strong>
            <br />
            <span>Correlation: {typeof cell.value === 'number' ? cell.value.toFixed(3) : 'N/A'}</span>
          </div>
        )}
      />
    </div>
  );
};

export default CorrelationMatrixChart;