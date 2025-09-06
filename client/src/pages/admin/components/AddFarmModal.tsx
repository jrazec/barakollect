import React, { useState } from 'react';

interface AddFarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (farmData: { name: string; lat: number; lng: number; owner: string }) => void;
}

const AddFarmModal: React.FC<AddFarmModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [farmName, setFarmName] = useState('');
  const [owner, setOwner] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (farmName.trim() && owner.trim()) {
      // Create farm without location initially
      onSubmit({
        name: farmName.trim(),
        owner: owner.trim(),
        lat: 0, // Default coordinates
        lng: 0
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFarmName('');
    setOwner('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative z-[10000]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[var(--espresso-black)]">
            Add New Farm
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farm Name
            </label>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--espresso-black)] focus:border-transparent"
              placeholder="Enter farm name"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owner Name
            </label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--espresso-black)] focus:border-transparent"
              placeholder="Enter owner name"
              required
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--espresso-black)] text-white rounded hover:bg-opacity-90"
            >
              Enter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFarmModal;
