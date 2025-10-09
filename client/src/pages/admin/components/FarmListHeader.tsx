import React from 'react';
import type { Farm } from '../../../services/adminService';

interface FarmListHeaderProps {
  farms: Farm[];
  selectedFarm: Farm | null;
  onFarmClick: (farm: Farm) => void;
  buttonText: string;
  onAddFarm: () => void;
  onCancel: () => void;
  onActionButtonClick: () => void;
}

const FarmListHeader: React.FC<FarmListHeaderProps> = ({
  farms,
  selectedFarm,
  onFarmClick,
  buttonText,
  onAddFarm,
  onCancel,
  onActionButtonClick
}) => {
  return (
    <div className="bg-[var(--white)] rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-main font-bold text-[var(--espresso-black)] text-lg">
          Available Farms
        </h3>
        <button
          onClick={onAddFarm}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
        >
          + Add New Farm
        </button>
      </div>

      <div className="bg-[var(--parchment)] border border-gray-300 rounded-lg p-4">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select a Farm to Manage
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            {farms.map((farm) => (
              <button
                key={farm.id}
                onClick={() => onFarmClick(farm)}
                className={`p-3 rounded-lg text-sm font-medium transition-all border-2 text-left ${
                  selectedFarm?.id === farm.id
                    ? 'bg-amber-800 text-white border-amber-900'
                    : farm.hasLocation
                    ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <div className="font-semibold truncate">{farm.name}</div>
                <div className="text-xs mt-1 flex items-center gap-1">
                  {farm.hasLocation ? (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Located</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      <span>No Location</span>
                    </>
                  )}
                </div>
                <div className="text-xs mt-1 opacity-75">
                  {farm.userCount} users • {farm.imageCount} images
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {selectedFarm ? (
            <span>Selected: <strong>{selectedFarm.name}</strong></span>
          ) : (
            <span>No farm selected</span>
          )}
        </div>
        <div className="flex gap-2">
          {selectedFarm && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onActionButtonClick}
            className={`px-6 py-2 rounded font-medium transition-all ${
              selectedFarm
                ? 'bg-[var(--espresso-black)] text-white hover:bg-opacity-90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!selectedFarm}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FarmListHeader;
