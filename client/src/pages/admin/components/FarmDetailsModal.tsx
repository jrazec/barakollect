import React, { useState, useMemo } from 'react';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'users' | 'images'>('overview');

  const handleDelete = () => {
    if (farmDetails) {
      onDelete(farmDetails.id);
    }
    setShowDeleteConfirm(false);
  };

  // Helper function to get status indicator color and icon
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'above':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: '↑', label: 'Above Average' };
      case 'below':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: '↓', label: 'Below Average' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: '→', label: 'Within Range' };
    }
  };

  // Morphological features data structure - always call useMemo (Rules of Hooks)
  const morphologicalFeatures = useMemo(() => {
    // Return empty array if no data available
    if (!farmDetails?.aggregatedData) return [];
    
    return [
      {
        title: "Bean Longest Length",
        unit: "mm",
        icon: "📏",
        farmValue: farmDetails.aggregatedData.major_axis_length?.value || 0,
        overallValue: farmDetails.aggregatedData.major_axis_length?.overall || 0,
        status: farmDetails.aggregatedData.major_axis_length?.status || 'neutral'
      },
      {
        title: "Bean Shortest Length",
        unit: "mm",
        icon: "📐",
        farmValue: farmDetails.aggregatedData.minor_axis_length?.value || 0,
        overallValue: farmDetails.aggregatedData.minor_axis_length?.overall || 0,
        status: farmDetails.aggregatedData.minor_axis_length?.status || 'neutral'
      },
      {
        title: "Bean Area",
        unit: "mm²",
        icon: "🔲",
        farmValue: farmDetails.aggregatedData.area?.value || 0,
        overallValue: farmDetails.aggregatedData.area?.overall || 0,
        status: farmDetails.aggregatedData.area?.status || 'neutral'
      },
      {
        title: "Perimeter",
        unit: "mm",
        icon: "⭕",
        farmValue: farmDetails.aggregatedData.perimeter?.value || 0,
        overallValue: farmDetails.aggregatedData.perimeter?.overall || 0,
        status: farmDetails.aggregatedData.perimeter?.status || 'neutral'
      },
      {
        title: "Aspect Ratio",
        unit: "",
        icon: "↔️",
        farmValue: farmDetails.aggregatedData.aspect_ratio?.value || 0,
        overallValue: farmDetails.aggregatedData.aspect_ratio?.overall || 0,
        status: farmDetails.aggregatedData.aspect_ratio?.status || 'neutral'
      },
      {
        title: "Circularity",
        unit: "",
        icon: "🔄",
        farmValue: farmDetails.aggregatedData.circularity?.value || 0,
        overallValue: farmDetails.aggregatedData.circularity?.overall || 0,
        status: farmDetails.aggregatedData.circularity?.status || 'neutral'
      },
      {
        title: "Extent",
        unit: "",
        icon: "📊",
        farmValue: farmDetails.aggregatedData.extent?.value || 0,
        overallValue: farmDetails.aggregatedData.extent?.overall || 0,
        status: farmDetails.aggregatedData.extent?.status || 'neutral'
      },
      {
        title: "Eccentricity",
        unit: "",
        icon: "🎯",
        farmValue: farmDetails.aggregatedData.eccentricity?.value || 0,
        overallValue: farmDetails.aggregatedData.eccentricity?.overall || 0,
        status: farmDetails.aggregatedData.eccentricity?.status || 'neutral'
      },
      {
        title: "Solidity",
        unit: "",
        icon: "⚪",
        farmValue: farmDetails.aggregatedData.solidity?.value || 0,
        overallValue: farmDetails.aggregatedData.solidity?.overall || 0,
        status: farmDetails.aggregatedData.solidity?.status || 'neutral'
      },
      {
        title: "Equivalent Diameter",
        unit: "mm",
        icon: "⭕",
        farmValue: farmDetails.aggregatedData.equivalent_diameter?.value || 0,
        overallValue: farmDetails.aggregatedData.equivalent_diameter?.overall || 0,
        status: farmDetails.aggregatedData.equivalent_diameter?.status || 'neutral'
      }
    ];
  }, [farmDetails?.aggregatedData]);

  // Early return after all hooks are called (follows Rules of Hooks)
  if (!isOpen || !farmDetails) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg max-w-7xl max-h-[95vh] overflow-hidden w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {farmDetails.name} - Farm Analytics
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Comprehensive analytics and morphological features analysis
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b bg-gray-50">
          <div className="px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-[var(--espresso-black)] text-[var(--espresso-black)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-[var(--espresso-black)] text-[var(--espresso-black)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bean Analytics
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'users'
                    ? 'border-[var(--espresso-black)] text-[var(--espresso-black)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users ({farmDetails.users.length})
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'images'
                    ? 'border-[var(--espresso-black)] text-[var(--espresso-black)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recent Images
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="h-[calc(95vh-180px)] overflow-y-auto">
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                    <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      User Activity
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700 font-medium">Total Users:</span>
                        <span className="text-lg font-bold text-blue-900">{farmDetails.userCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700 font-medium">Owner:</span>
                        <span className="text-lg font-bold text-blue-900">{farmDetails.owner}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700 font-medium">Quality Rating:</span>
                        <span className="text-lg font-bold text-blue-900">{farmDetails.qualityRating}/5</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                    <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Image Statistics
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-700 font-medium">Total Images:</span>
                        <span className="text-lg font-bold text-green-900">{farmDetails.imageCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-700 font-medium">Validated:</span>
                        <span className="text-lg font-bold text-green-600">{farmDetails.validatedUploads}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-700 font-medium">Pending:</span>
                        <span className="text-lg font-bold text-yellow-600">{farmDetails.pendingValidations}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                    <h4 className="font-semibold text-purple-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Farm Activity
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-700 font-medium">Last Activity:</span>
                        <span className="text-sm font-bold text-purple-900">{farmDetails.lastActivity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-700 font-medium">Created:</span>
                        <span className="text-sm font-bold text-purple-900">{farmDetails.createdDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Uploads Chart */}
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Monthly Upload Activity
                  </h4>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {farmDetails.aggregatedData.monthlyUploads.map((month) => (
                      <div key={month.month} className="text-center bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">{month.month.trim()}</div>
                        <div className="text-2xl font-bold text-gray-900">{month.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Morphological Features Analysis</h3>
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-blue-800">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Comparing farm averages against overall database averages (±10% tolerance)</span>
                  </div>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-4">
                  {morphologicalFeatures.map((feature) => {
                    const indicator = getStatusIndicator(feature.status);
                    return (
                      <div key={feature.title} className="bg-white rounded-xl p-4 border-2 border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-gray-800">{feature.title}</h5>
                          <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${indicator.bg} ${indicator.color}`}>
                            <span>{indicator.icon}</span>
                            <span>{indicator.label}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Farm Average:</span>
                            <span className="font-bold text-lg">
                              {feature.farmValue.toFixed(feature.unit === '' ? 3 : 2)}{feature.unit && ` ${feature.unit}`}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Overall Average:</span>
                            <span className="font-medium text-gray-700">
                              {feature.overallValue.toFixed(feature.unit === '' ? 3 : 2)}{feature.unit && ` ${feature.unit}`}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Difference:</span>
                            <span className={`font-medium ${indicator.color}`}>
                              {feature.overallValue > 0 ? 
                                `${((feature.farmValue - feature.overallValue) / feature.overallValue * 100).toFixed(1)}%`
                                : 'N/A'
                              }
                            </span>
                          </div>
                        </div>
                        
                        {/* Visual progress bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                feature.status === 'above' ? 'bg-green-500' :
                                feature.status === 'below' ? 'bg-red-500' : 'bg-gray-400'
                              }`}
                              style={{ 
                                width: feature.overallValue > 0 ? 
                                  `${Math.min(100, Math.max(10, (feature.farmValue / feature.overallValue) * 50))}%` : 
                                  '50%' 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bean Types Distribution */}
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    Bean Types Distribution
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {farmDetails.aggregatedData.commonBeanTypes?.map((type, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Active Users</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {farmDetails.users.map((user) => (
                    <div key={user.id} className="bg-white rounded-xl p-4 border-2 border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-600 capitalize">{user.role}</div>
                          <div className="text-xs text-blue-600 font-medium">{user.uploads} uploads</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Recent Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {farmDetails.recentImages.map((image) => (
                    <div key={image.id} className="bg-white rounded-xl overflow-hidden border-2 border-gray-200">
                      <div className="aspect-square bg-gray-100 relative">
                        <img 
                          src={image.url} 
                          alt={`Image ${image.id}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {image.beanCount} beans
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="text-xs text-gray-500 truncate">
                          {new Date(image.uploadDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
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
