import React, { useState } from 'react';
import type { FarmDetails } from '../../../services/adminService';

interface FarmDetailsModalProps {
  isOpen: boolean;
  farmDetails: FarmDetails | null;
  onClose: () => void;
  onDelete: (farmId: string) => void;
}

const FarmDetailsModal: React.FC<FarmDetailsModalProps> = ({
  isOpen,
  farmDetails,
  onClose,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !farmDetails) return null;

  const handleDelete = () => {
    onDelete(farmDetails.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4 relative z-[10000]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[var(--espresso-black)]">
            {farmDetails.name} - Detailed Analytics
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Farm Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-[var(--espresso-black)] mb-3">Farm Overview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Owner:</span>
                <span className="font-medium">{farmDetails.owner}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Users:</span>
                <span className="font-medium">{farmDetails.userCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Images:</span>
                <span className="font-medium">{farmDetails.imageCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Validated Uploads:</span>
                <span className="font-medium">{farmDetails.validatedUploads}/{farmDetails.imageCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Quality Rating:</span>
                <span className="font-medium">{farmDetails.qualityRating}/5</span>
              </div>
              <div className="flex justify-between">
                <span>Last Activity:</span>
                <span className="font-medium">{farmDetails.lastActivity}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="font-medium">{farmDetails.createdDate}</span>
              </div>
            </div>
          </div>

          {/* Bean Analytics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-[var(--espresso-black)] mb-3">Bean Analytics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Avg Bean Length:</span>
                <span className="font-medium">{farmDetails.aggregatedData.avgBeanLength} mm</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Bean Width:</span>
                <span className="font-medium">{farmDetails.aggregatedData.avgBeanWidth} mm</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Bean Area:</span>
                <span className="font-medium">{farmDetails.aggregatedData.avgBeanArea} mm²</span>
              </div>
              <div className="flex justify-between">
                <span>Common Types:</span>
                <span className="font-medium">{farmDetails.aggregatedData.commonBeanTypes && farmDetails.aggregatedData.commonBeanTypes.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="mb-6">
          <h4 className="font-semibold text-[var(--espresso-black)] mb-3">Active Users</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {farmDetails.users.map((user) => (
                <div key={user.id} className="bg-white rounded p-3 text-sm">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-gray-600">{user.role}</div>
                  <div className="text-gray-600">{user.uploads} uploads</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quality Distribution */}
        <div className="mb-6">
          <h4 className="font-semibold text-[var(--espresso-black)] mb-3">Quality Distribution</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              {farmDetails.aggregatedData.qualityDistribution && Object.entries(farmDetails.aggregatedData.qualityDistribution).map(([quality, percentage]) => (
                <div key={quality} className="text-center">
                  <div className="font-medium">{quality}</div>
                  <div className="text-2xl font-bold text-[var(--espresso-black)]">{percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Uploads */}
        <div className="mb-6">
          <h4 className="font-semibold text-[var(--espresso-black)] mb-3">Monthly Upload Trend</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex gap-4 text-sm">
              {farmDetails.aggregatedData.monthlyUploads.map((month) => (
                <div key={month.month} className="text-center">
                  <div className="font-medium">{month.month}</div>
                  <div className="text-xl font-bold text-[var(--espresso-black)]">{month.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Images */}
        <div className="mb-6">
          <h4 className="font-semibold text-[var(--espresso-black)] mb-3">Recent Images</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {farmDetails.recentImages.map((image) => (
                <div key={image.id} className="text-center">
                  <div className="w-full h-16 bg-gray-300 rounded mb-1 flex items-center justify-center text-xs">
                    Image Preview
                  </div>
                  <div className="text-xs text-gray-600">{image.beanCount} beans</div>
                  <div className="text-xs text-gray-500">{image.uploadDate}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete Farm
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[var(--espresso-black)] text-white rounded hover:bg-opacity-90"
          >
            Close
          </button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-[10001]">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative z-[10002]">
              <h4 className="text-lg font-bold text-red-600 mb-4">Confirm Deletion</h4>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete "{farmDetails.name}"? This action cannot be undone and will remove all associated data.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmDetailsModal;
