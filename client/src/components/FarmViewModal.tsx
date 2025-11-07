import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Types based on existing interfaces
interface FarmViewData {
  id: string;
  name: string;
  users: Array<{
    id: string;
    name: string;
    role: string;
    uploads: number;
  }>;
  recentImages: Array<{
    id: string;
    url: string;
    uploadDate: string;
    beanCount: number;
  }>;
  aggregatedData: {
    major_axis_length?: { value: number; overall: number; status: string };
    minor_axis_length?: { value: number; overall: number; status: string };
    area?: { value: number; overall: number; status: string };
    perimeter?: { value: number; overall: number; status: string };
    aspect_ratio?: { value: number; overall: number; status: string };
    circularity?: { value: number; overall: number; status: string };
    extent?: { value: number; overall: number; status: string };
    eccentricity?: { value: number; overall: number; status: string };
    solidity?: { value: number; overall: number; status: string };
    equivalent_diameter?: { value: number; overall: number; status: string };
  };
  beanTypes: string[];
  monthlyUploads: Array<{
    month: string;
    uploads: number;
  }>;
}

interface FarmViewModalProps {
  isOpen: boolean;
  farmData: FarmViewData | null;
  onClose: () => void;
}

const FarmViewModal: React.FC<FarmViewModalProps> = ({
  isOpen,
  farmData,
  onClose
}) => {
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

  // Morphological features data structure
  const morphologicalFeatures = useMemo(() => {
    if (!farmData?.aggregatedData) return [];
    
    return [
      {
        title: "Bean Longest Length",
        unit: "mm",
        icon: "📏",
        farmValue: farmData.aggregatedData.major_axis_length?.value || 0,
        overallValue: farmData.aggregatedData.major_axis_length?.overall || 0,
        status: farmData.aggregatedData.major_axis_length?.status || 'neutral'
      },
      {
        title: "Bean Shortest Length",
        unit: "mm",
        icon: "📐",
        farmValue: farmData.aggregatedData.minor_axis_length?.value || 0,
        overallValue: farmData.aggregatedData.minor_axis_length?.overall || 0,
        status: farmData.aggregatedData.minor_axis_length?.status || 'neutral'
      },
      {
        title: "Bean Area",
        unit: "mm²",
        icon: "🔲",
        farmValue: farmData.aggregatedData.area?.value || 0,
        overallValue: farmData.aggregatedData.area?.overall || 0,
        status: farmData.aggregatedData.area?.status || 'neutral'
      },
      {
        title: "Perimeter",
        unit: "mm",
        icon: "⭕",
        farmValue: farmData.aggregatedData.perimeter?.value || 0,
        overallValue: farmData.aggregatedData.perimeter?.overall || 0,
        status: farmData.aggregatedData.perimeter?.status || 'neutral'
      },
      {
        title: "Aspect Ratio",
        unit: "",
        icon: "↔️",
        farmValue: farmData.aggregatedData.aspect_ratio?.value || 0,
        overallValue: farmData.aggregatedData.aspect_ratio?.overall || 0,
        status: farmData.aggregatedData.aspect_ratio?.status || 'neutral'
      },
      {
        title: "Circularity",
        unit: "",
        icon: "🔄",
        farmValue: farmData.aggregatedData.circularity?.value || 0,
        overallValue: farmData.aggregatedData.circularity?.overall || 0,
        status: farmData.aggregatedData.circularity?.status || 'neutral'
      },
      {
        title: "Extent",
        unit: "",
        icon: "📊",
        farmValue: farmData.aggregatedData.extent?.value || 0,
        overallValue: farmData.aggregatedData.extent?.overall || 0,
        status: farmData.aggregatedData.extent?.status || 'neutral'
      },
      {
        title: "Eccentricity",
        unit: "",
        icon: "🎯",
        farmValue: farmData.aggregatedData.eccentricity?.value || 0,
        overallValue: farmData.aggregatedData.eccentricity?.overall || 0,
        status: farmData.aggregatedData.eccentricity?.status || 'neutral'
      },
      {
        title: "Solidity",
        unit: "",
        icon: "⚪",
        farmValue: farmData.aggregatedData.solidity?.value || 0,
        overallValue: farmData.aggregatedData.solidity?.overall || 0,
        status: farmData.aggregatedData.solidity?.status || 'neutral'
      },
      {
        title: "Equivalent Diameter",
        unit: "mm",
        icon: "⭕",
        farmValue: farmData.aggregatedData.equivalent_diameter?.value || 0,
        overallValue: farmData.aggregatedData.equivalent_diameter?.overall || 0,
        status: farmData.aggregatedData.equivalent_diameter?.status || 'neutral'
      }
    ];
  }, [farmData?.aggregatedData]);

  if (!isOpen || !farmData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg max-w-5xl max-h-[90vh] overflow-hidden w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-[var(--mocha-beige)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--espresso-black)]">
              {farmData.name} - Farm Overview
            </h2>
            <p className="text-sm text-[var(--espresso-black)] mt-1 opacity-80">
              Bean analytics, farm users, and recent activity
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--espresso-black)] hover:text-gray-700 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="h-[calc(90vh-140px)] overflow-y-auto p-6 space-y-6">
          {/* Bean Analytics Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--espresso-black)] border-b border-gray-200 pb-2">
              📊 Bean Analytics
            </h3>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Analytics Overview:</strong> Morphological features comparison between this farm and overall database averages. 
                Green indicators show above-average measurements, red shows below-average.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-4">
              {morphologicalFeatures.map((feature, index) => {
                const indicator = getStatusIndicator(feature.status);
                return (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{feature.icon}</span>
                        <span className="font-medium text-gray-800">{feature.title}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${indicator.bg} ${indicator.color} flex items-center gap-1`}>
                        <span>{indicator.icon}</span>
                        <span>{indicator.label}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">This Farm:</span>
                        <span className="font-bold text-[var(--espresso-black)]">
                          {feature.farmValue.toFixed(2)} {feature.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Overall Avg:</span>
                        <span className="text-gray-500">
                          {feature.overallValue.toFixed(2)} {feature.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bean Types Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="font-medium text-gray-800 mb-3">Bean Types Found</h4>
              <div className="flex flex-wrap gap-2">
                {farmData.beanTypes.length > 0 ? (
                  farmData.beanTypes.map((type, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[var(--mocha-beige)] text-[var(--espresso-black)] rounded-full text-sm"
                    >
                      {type}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No bean types data available</span>
                )}
              </div>
            </div>

            {/* Monthly Uploads Chart */}
            {farmData.monthlyUploads && farmData.monthlyUploads.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="font-medium text-gray-800 mb-3">Monthly Upload Activity</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={farmData.monthlyUploads} margin={{ top: 1, right: 0, left: -5, bottom: 0 }}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Line type="monotone" dataKey="uploads" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Users Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--espresso-black)] border-b border-gray-200 pb-2">
              👥 Active Users ({farmData.users.length})
            </h3>
            
            <div className="grid gap-3">
              {farmData.users.length > 0 ? (
                farmData.users.map((user, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-800">{user.name}</div>
                        <div className="text-sm text-gray-600 capitalize">{user.role}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[var(--espresso-black)]">{user.uploads}</div>
                        <div className="text-xs text-gray-500">uploads</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No active users found for this farm
                </div>
              )}
            </div>
          </div>

          {/* Recent Images Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--espresso-black)] border-b border-gray-200 pb-2">
              📸 Recent Images
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {farmData.recentImages.length > 0 ? (
                farmData.recentImages.map((image, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      {image.url ? (
                        <img
                          src={image.url}
                          alt="Bean sample"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-4xl">📷</div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {new Date(image.uploadDate).toLocaleDateString()}
                        </span>
                        <span className="font-medium text-[var(--espresso-black)]">
                          {image.beanCount} beans
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No recent images available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[var(--espresso-black)] text-white rounded hover:bg-opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FarmViewModal;