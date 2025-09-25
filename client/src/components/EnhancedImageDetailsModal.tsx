import React, { useState } from 'react';
import BeanDetectionCanvas from './BeanDetectionCanvas';
import BeanImageExtractor from './BeanImageExtractor';
import { 
  calculateBeanMetrics, 
  findLargestBean, 
  findSmallestBean, 
  getBeanCardStyling 
} from '../utils/beanAnalysisUtils';

interface BeanDetection {
  bean_id: number;
  is_validated?: boolean | null;
  bean_type?: string;
  confidence?: number;
  length_mm: number;
  width_mm: number;
  bbox: [number, number, number, number];
  comment?: string;
  detection_date?: string;
  features?: { [key: string]: any };
}

interface EnhancedImageData {
  id?: string;
  src: string;
  predictions?: BeanDetection[];
  userName?: string;
  userRole?: string;
  location?: string;
  upload_date?: string;
  submissionDate?: string;
  allegedVariety?: string;
}

interface EnhancedImageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: EnhancedImageData;
  userRole?: 'farmer' | 'researcher' | 'admin';
  onValidateBean?: (beanId: number, validated: boolean) => void;
  onDeleteImage?: (id: string) => void;
}

const EnhancedImageDetailsModal: React.FC<EnhancedImageDetailsModalProps> = ({
  isOpen,
  onClose,
  image,
  userRole = 'farmer',
  onValidateBean,
  onDeleteImage
}) => {
  const [selectedBeanId, setSelectedBeanId] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState<'overview' | 'beans' | 'analysis'>('overview');
  const [showBeanBoxes, setShowBeanBoxes] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!isOpen) return null;

  const beans = image.predictions || [];
  const selectedBean = beans.find(bean => bean.bean_id === selectedBeanId);

  // Find best candidate (largest bean)
  const bestCandidate = beans.length > 0
    ? beans.reduce((prev, current) =>
      (prev.features?.area_mm2 > current.features?.area_mm2) ? prev : current
    )
    : null;

  const validatedCount = beans.filter(bean => bean.is_validated === true).length;
  const pendingCount = beans.filter(bean => bean.is_validated === false || bean.is_validated === null || bean.is_validated === undefined).length;

  const handleValidateBean = (beanId: number, validated: boolean) => {
    if (onValidateBean) {
      onValidateBean(beanId, validated);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-7xl max-h-[95vh] overflow-hidden w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Bean Analysis Results
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {beans.length} beans detected • {validatedCount} validated • {pendingCount} pending
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
        <div className="bg-gray-50">
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
                onClick={() => setActiveTab('beans')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'beans'
                    ? 'border-[var(--espresso-black)] text-[var(--espresso-black)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bean Details ({beans.length})
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'analysis'
                    ? 'border-[var(--espresso-black)] text-[var(--espresso-black)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="h-[calc(95vh-180px)] overflow-y-auto">
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Bean Visualization - Large and Responsive */}
                <div className="w-full">
                  <div className="h-96 md:h-[500px]">
                    <BeanDetectionCanvas
                      imageSrc={image.src}
                      beans={beans}
                      selectedBeanId={selectedBeanId}
                      onBeanSelect={setSelectedBeanId}
                      highlightBestCandidate={userRole === 'farmer'}
                      showBeanBoxes={showBeanBoxes}
                      zoomLevel={zoomLevel}
                      showZoomControls={true}
                      onZoomChange={setZoomLevel}
                      className="h-full rounded-lg"
                    />
                  </div>
                </div>

                {/* Information Cards Below Image */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Image Information */}
                  {image.userName || image.userRole || image.location || image.upload_date || image.allegedVariety && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Image Information
                    </h6>
                    <div className="text-sm text-gray-600 space-y-2">
                      {image.userName && (
                        <div className="flex justify-between">
                          <span className="font-medium">Submitted by:</span>
                          <span>{image.userName}</span>
                        </div>
                      )}
                      {image.userRole && (
                        <div className="flex justify-between">
                          <span className="font-medium">Role:</span>
                          <span className="capitalize">{image.userRole}</span>
                        </div>
                      )}
                      {image.location && (
                        <div className="flex justify-between">
                          <span className="font-medium">Location:</span>
                          <span>{image.location}</span>
                        </div>
                      )}
                      {(image.upload_date || image.submissionDate) && (
                        <div className="flex justify-between">
                          <span className="font-medium">Date:</span>
                          <span>{new Date(image.upload_date || image.submissionDate || '').toLocaleDateString()}</span>
                        </div>
                      )}
                      {image.allegedVariety && (
                        <div className="flex justify-between">
                          <span className="font-medium">Alleged Variety:</span>
                          <span>{image.allegedVariety}</span>
                        </div>
                      )}
                    </div>

                  </div>
                                      )}

                  {/* Detection Summary */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h6 className="font-semibold text-green-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Detection Summary
                    </h6>
                    <div className="text-sm text-green-700 space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Total Beans:</span>
                        <span className="text-lg font-bold">{beans.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Validated:</span>
                        <span className="text-lg font-bold text-green-600">{validatedCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Pending:</span>
                        <span className="text-lg font-bold text-yellow-600">{pendingCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Validation Rate:</span>
                        <span className="text-lg font-bold">
                          {beans.length > 0 ? ((validatedCount / beans.length) * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Best Candidate for Farmers */}
                  {bestCandidate && userRole === 'farmer' && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h6 className="font-semibold text-blue-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        Best Candidate for Planting
                      </h6>
                      <div className="text-sm text-blue-700 space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Bean ID:</span>
                          <span className="font-bold">#{bestCandidate.bean_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Longest Side:</span>
                          <span>{bestCandidate.length_mm.toFixed(1)} mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Shortest Side:</span>
                          <span>{bestCandidate.width_mm.toFixed(1)} mm</span>
                        </div>
                        {bestCandidate.bean_type && (
                          <div className="flex justify-between">
                            <span className="font-medium">Type:</span>
                            <span>{bestCandidate.bean_type}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'beans' && (
              <div className="space-y-6">
                {/* Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg">
                  {/* Bean Selector Dropdown */}
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Select Bean:</label>
                    <select
                      value={selectedBeanId || ''}
                      onChange={(e) => setSelectedBeanId(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-48"
                    >
                      <option value="">Select a bean...</option>
                      {beans.map((bean) => (
                        <option key={bean.bean_id} value={bean.bean_id}>
                          Bean #{bean.bean_id} - {bean.length_mm.toFixed(1)}×{bean.width_mm.toFixed(1)}mm
                          {bean.bean_id === bestCandidate?.bean_id && userRole === 'farmer' ? ' (BEST)' : ''}
                          {bean.is_validated === true ? ' ✓' : bean.is_validated === false ? ' ⏳' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Show Bean Boxes:</label>
                      <button
                        onClick={() => setShowBeanBoxes(!showBeanBoxes)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          showBeanBoxes ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            showBeanBoxes ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Bean Visualization - Takes up more space */}
                  <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold mb-4">Bean Visualization</h3>
                    <div className="h-96 md:h-[500px]">
                      <BeanDetectionCanvas
                        imageSrc={image.src}
                        beans={beans}
                        selectedBeanId={selectedBeanId}
                        onBeanSelect={setSelectedBeanId}
                        highlightBestCandidate={userRole === 'farmer'}
                        showBeanBoxes={showBeanBoxes}
                        zoomLevel={zoomLevel}
                        showZoomControls={true}
                        onZoomChange={setZoomLevel}
                        className="h-full  rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Bean Details */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Bean Details</h3>
                    {selectedBean ? (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Bean #{selectedBean.bean_id}</h4>
                          {userRole !== 'farmer' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleValidateBean(selectedBean.bean_id, true)}
                                className={`px-3 py-1 text-xs rounded ${selectedBean.is_validated === true
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                                  }`}
                              >
                                Validate
                              </button>
                              <button
                                onClick={() => handleValidateBean(selectedBean.bean_id, false)}
                                className={`px-3 py-1 text-xs rounded ${selectedBean.is_validated === false
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
                                  }`}
                              >
                                Pending
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium text-gray-700">Length</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {selectedBean.length_mm.toFixed(2)} mm
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">Width</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {selectedBean.width_mm.toFixed(2)} mm
                            </div>
                          </div>
                        </div>

                        {selectedBean.bean_type && (
                          <div>
                            <div className="text-sm font-medium text-gray-700">Bean Type</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {selectedBean.bean_type}
                              {selectedBean.confidence && (
                                <span className="text-sm text-gray-500 ml-2">
                                  ({(selectedBean.confidence * 100).toFixed(0)}% confidence)
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="text-sm font-medium text-gray-700">Validation Status</div>
                          <div className={`inline-block px-2 py-1 rounded text-sm ${selectedBean.is_validated === true
                            ? 'bg-green-100 text-green-800'
                            : selectedBean.is_validated === false
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}>
                            {selectedBean.is_validated === true ? 'Validated' :
                              selectedBean.is_validated === false ? 'Pending Validation' : 'Unknown'}
                          </div>
                        </div>

                        {selectedBean.comment && (
                          <div>
                            <div className="text-sm font-medium text-gray-700">Comment</div>
                            <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                              {selectedBean.comment}
                            </div>
                          </div>
                        )}

                        {selectedBean.bean_id === bestCandidate?.bean_id && userRole === 'farmer' && (
                          <div className="bg-green-100 border border-green-300 rounded p-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-green-600 font-bold">🌱</span>
                              <span className="text-green-800 font-medium">Best Candidate for Planting</span>
                            </div>
                            <p className="text-green-700 text-sm mt-1">
                              This bean has the largest size and is recommended for planting.
                            </p>
                          </div>
                        )}

                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <h6 className="font-medium text-blue-800 mb-2">Additional Measurements</h6>
                          <div className="grid grid-cols-1 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium text-blue-700">Area:</span>
                              <span>{selectedBean?.features?.area_mm2?.toFixed(2) || 'N/A'} mm²</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-blue-700">Perimeter:</span>
                              <span>{selectedBean?.features?.perimeter_mm?.toFixed(2) || 'N/A'} mm</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-blue-700">Major Axis:</span>
                              <span>{selectedBean?.features?.major_axis_length_mm?.toFixed(2) || 'N/A'} mm</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-blue-700">Minor Axis:</span>
                              <span>{selectedBean?.features?.minor_axis_length_mm?.toFixed(2) || 'N/A'} mm</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-blue-700">Extent:</span>
                              <span>{selectedBean?.features?.extent?.toFixed(3) || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-blue-700">Eccentricity:</span>
                              <span>{selectedBean?.features?.eccentricity?.toFixed(3) || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                        Select a bean from the dropdown to view its details
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Statistical Analysis</h3>
                {beans.length > 0 ? (
                  <div className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                        <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Size Distribution
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-700 font-medium">Largest Bean:</span>
                            <span className="text-lg font-bold text-blue-900">
                              {Math.max(...beans.map(b => b.features?.area_mm2)).toFixed(1)} mm
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-700 font-medium">Smallest Bean:</span>
                            <span className="text-lg font-bold text-blue-900">
                              {Math.min(...beans.map(b => b.features?.area_mm2)).toFixed(1)} mm
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-700 font-medium">Average of Longest Side:</span>
                            <span className="text-lg font-bold text-blue-900">
                              {(beans.reduce((sum, b) => sum + b.length_mm, 0) / beans.length).toFixed(1)} mm
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-700 font-medium">Average of Shortest Side:</span>
                            <span className="text-lg font-bold text-blue-900">
                              {(beans.reduce((sum, b) => sum + b.width_mm, 0) / beans.length).toFixed(1)} mm
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                        <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Validation Status
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-green-700 font-medium">Total Beans:</span>
                            <span className="text-lg font-bold text-green-900">{beans.length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-green-700 font-medium">Validated:</span>
                            <span className="text-lg font-bold text-green-600">{validatedCount}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-green-700 font-medium">Pending:</span>
                            <span className="text-lg font-bold text-yellow-600">{pendingCount}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-green-700 font-medium">Validation Rate:</span>
                            <span className="text-lg font-bold text-green-900">
                              {beans.length > 0 ? ((validatedCount / beans.length) * 100).toFixed(0) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bean Specimens - All Beans */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          All Bean Specimens
                        </div>
                        <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                          {beans.length} beans detected
                        </span>
                      </h4>
                      
                      <div className="grid lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                        {(() => {
                          // Use utility functions for finding largest/smallest beans
                          const largestBean = findLargestBean(beans);
                          const smallestBean = findSmallestBean(beans);
                          const largestBeanId = largestBean?.bean_id || 0;
                          const smallestBeanId = smallestBean?.bean_id || 0;

                          return beans.map((bean) => {
                            // Calculate metrics using utility functions
                            const metrics = calculateBeanMetrics(bean);
                            
                            // Get styling based on bean status
                            const styling = getBeanCardStyling(bean, largestBeanId, smallestBeanId);

                            return (
                              <div key={bean.bean_id} className={styling.cardClass}>
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className={`font-semibold ${styling.headerColor} flex items-center text-sm`}>
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                                    </svg>
                                    Bean #{bean.bean_id}
                                  </h5>
                                  <span className={styling.badgeClass}>
                                    {styling.badgeText}
                                  </span>
                                </div>
                                
                                <div className="bg-gray-100 rounded-lg p-2 mb-3 h-24 flex items-center justify-center">
                                  <BeanImageExtractor bean={bean} imageSrc={image.src} />
                                </div>
                                
                                {/* Basic measurements */}
                                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                  <div className="text-center">
                                    <div className="text-gray-600">Length</div>
                                    <div className={`font-bold ${styling.valueColor}`}>
                                      {metrics.length.toFixed(1)} mm
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-gray-600">Width</div>
                                    <div className={`font-bold ${styling.valueColor}`}>
                                      {metrics.width.toFixed(1)} mm
                                    </div>
                                  </div>
                                  {metrics.area > 0 && (
                                    <div className="text-center">
                                      <div className="text-gray-600">Area</div>
                                      <div className={`font-semibold ${styling.valueColor}`}>
                                        {metrics.area.toFixed(1)} mm²
                                      </div>
                                    </div>
                                  )}
                                  {metrics.perimeter > 0 && (
                                    <div className="text-center">
                                      <div className="text-gray-600">Perimeter</div>
                                      <div className={`font-semibold ${styling.valueColor}`}>
                                        {metrics.perimeter.toFixed(1)} mm
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Advanced metrics */}
                                <div className="border-t border-gray-200 pt-2">
                                  <div className="grid grid-cols-3 gap-2 text-xs">
                                    {metrics.circularity && (
                                      <div className="text-center">
                                        <div className="text-gray-500">Circularity</div>
                                        <div className="font-medium text-gray-800">
                                          {metrics.circularity.toFixed(3)}
                                        </div>
                                      </div>
                                    )}
                                    <div className="text-center">
                                      <div className="text-gray-500">Aspect Ratio</div>
                                      <div className="font-medium text-gray-800">
                                        {metrics.aspectRatio.toFixed(2)}
                                      </div>
                                    </div>
                                    {metrics.solidity && (
                                      <div className="text-center">
                                        <div className="text-gray-500">Solidity</div>
                                        <div className="font-medium text-gray-800">
                                          {metrics.solidity.toFixed(3)}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.9.785-5.291 2.09M6.343 6.343A8 8 0 1017.657 17.657 8 8 0 006.343 6.343z" />
                    </svg>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h4>
                    <p>No beans detected for analysis</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 bg-gray-50">
          <div className="text-sm text-gray-600">
            {beans.length} beans • {validatedCount} validated
          </div>
          <div className="flex space-x-3">
            {userRole === 'admin' && onDeleteImage && image.id && (
              <button
                onClick={() => onDeleteImage(image.id!)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete Image
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[var(--espresso-black)] text-white rounded hover:bg-opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedImageDetailsModal;
