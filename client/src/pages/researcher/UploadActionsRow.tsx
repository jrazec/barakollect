import React from 'react';

interface UploadActionsRowProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  'Predict Image',
  'Submit Image',
  'Find Largest Bean',
];

const UploadActionsRow: React.FC<UploadActionsRowProps> = ({ activeTab, onTabChange }) => (
  <div className="flex w-full mb-4">
    {tabs.map((tab, idx) => (
      <button
        key={tab}
        className={`upload-action-btn flex-1 px-2 py-1 text-xs font-main font-bold text-[var(--espresso-black)] border border-[var(--mocha-beige)]
          ${idx === 0 ? 'rounded-l' : ''} ${idx === tabs.length - 1 ? 'rounded-r' : ''}
          ${activeTab === tab ? 'bg-[var(--mocha-beige)]' : 'bg-[var(--parchment)]'}`}
        onClick={() => onTabChange(tab)}
        type="button"
      >
        {tab}
      </button>
    ))}
  </div>
);

export default UploadActionsRow;