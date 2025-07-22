import React from 'react';

const farms = [
  { id: 'A', name: 'Farm A', x: 180, y: 120, beans: 34, avgSize: 13.2, quality: 3.7 },
  { id: 'B', name: 'Farm B', x: 260, y: 140, beans: 21, avgSize: 12.8, quality: 3.5 },
  { id: 'C', name: 'Farm C', x: 320, y: 100, beans: 18, avgSize: 14.1, quality: 3.9 },
];

const MapCard: React.FC = () => {
  return (
    <div className="bg-[var(--parchment)] rounded-lg shadow p-4 mb-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-main font-bold text-[var(--espresso-black)] text-lg">
          &#128506; Geographic Data View
        </span>
        <span className="text-xs font-accent text-[var(--espresso-black)] ml-auto">
          Farm locations and bean production statistics
        </span>
      </div>
      <div className="relative w-full h-80 bg-white rounded-lg overflow-hidden border border-[var(--mocha-beige)]">
        {/* SVG Map */}
        <svg viewBox="0 0 500 300" className="absolute top-0 left-0 w-full h-full">
          <polygon
            points="50,50 450,50 400,250 100,250"
            fill="#F5F5DC"
            stroke="#795548"
            strokeWidth="2"
          />
          <polygon
            points="120,100 380,100 350,220 150,220"
            fill="#EADFCB"
            stroke="#795548"
            strokeWidth="1"
          />
          {farms.map((farm) => (
            <g key={farm.id}>
              <circle cx={farm.x} cy={farm.y} r="24" fill="#D7BBA8" opacity="0.7" />
              <circle cx={farm.x} cy={farm.y} r="12" fill="#795548" />
              <text
                x={farm.x}
                y={farm.y + 5}
                textAnchor="middle"
                fontSize="16"
                fill="#fff"
                fontFamily="Poppins"
              >
                {farm.id}
              </text>
            </g>
          ))}
        </svg>

        {/* Popups */}
        {farms.map((farm) => (
          <div key={farm.id} className="absolute" style={{ left: farm.x - 40, top: farm.y + 30 }}>
            <div className="bg-white rounded shadow p-2 text-xs font-accent text-[var(--espresso-black)] min-w-[120px]">
              <div className="font-bold">{farm.name}</div>
              <div>Bean Count: {farm.beans}</div>
              <div>Avg Size: {farm.avgSize} mm</div>
              <div>Quality: {farm.quality}</div>
            </div>
          </div>
        ))}

        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button className="bg-white border border-[var(--mocha-beige)] rounded p-1 text-xs">+</button>
          <button className="bg-white border border-[var(--mocha-beige)] rounded p-1 text-xs">-</button>
          <button className="bg-white border border-[var(--mocha-beige)] rounded p-1 text-xs">&#128295;</button>
        </div>
        <span className="absolute bottom-2 right-4 text-xs text-stone-400">100%</span>
      </div>

      {/* Legend */}
      <div className="flex justify-between text-xs text-stone-400 mt-2">
        <span>Showing data from 3 farms across the region</span>
        <span>Active Farms</span>
        <span>Selected Farms</span>
      </div>
    </div>
  );
};

export default MapCard;
