import React, { useState } from 'react';
import BeanDetectionCanvas from './BeanDetectionCanvas';

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
  const [editMode, setEditMode] = useState(false);

  if (!isOpen) return null;

  const beans = image.predictions || [];
  const selectedBean = beans.find(bean => bean.bean_id === selectedBeanId);
  
  // Find best candidate (largest bean)
  const bestCandidate = beans.length > 0 
    ? beans.reduce((prev, current) => 
        (prev.length_mm > current.length_mm) ? prev : current
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
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Bean Analysis Results
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {beans.length} beans detected • {validatedCount} validated • {pendingCount} pending
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {userRole === 'admin' && !editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-100px)]">
          {/* Left Panel - Navigation */}
          <div className="w-80 border-r bg-gray-50 overflow-y-auto">
            <div className="p-4">
              {/* Tab Navigation */}
              <div className="flex flex-col space-y-2 mb-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-2 text-left rounded ${
                    activeTab === 'overview'
                      ? 'bg-[var(--espresso-black)] text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('beans')}
                  className={`px-3 py-2 text-left rounded ${
                    activeTab === 'beans'
                      ? 'bg-[var(--espresso-black)] text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Bean Details ({beans.length})
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-3 py-2 text-left rounded ${
                    activeTab === 'analysis'
                      ? 'bg-[var(--espresso-black)] text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Analysis
                </button>
              </div>

              {/* Bean List (when beans tab is active) */}
              {activeTab === 'beans' && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Select Bean</h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {beans.map((bean) => (
                      <div
                        key={bean.bean_id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                          selectedBeanId === bean.bean_id
                            ? 'bg-[var(--espresso-black)] text-white border-gray-900'
                            : 'bg-white hover:bg-gray-100 border-gray-200'
                        }`}
                        onClick={() => setSelectedBeanId(bean.bean_id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Bean #{bean.bean_id}</span>
                          <div className="flex items-center space-x-1">
                            {bean.bean_id === bestCandidate?.bean_id && userRole === 'farmer' && (
                              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                                BEST
                              </span>
                            )}
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                bean.is_validated === true
                                  ? 'bg-green-100 text-green-800'
                                  : bean.is_validated === false
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {bean.is_validated === true ? 'Validated' : 
                               bean.is_validated === false ? 'Pending' : 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm opacity-75 mt-1">
                          {bean.length_mm.toFixed(1)} × {bean.width_mm.toFixed(1)} mm
                        </div>
                        {bean.bean_type && (
                          <div className="text-sm opacity-75">
                            {bean.bean_type} {bean.confidence && `(${(bean.confidence * 100).toFixed(0)}%)`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Info (when overview tab is active) */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-3">
                    <h6 className="font-medium text-gray-800 mb-2">Image Information</h6>
                    <div className="text-sm text-gray-600 space-y-1">
                      {image.userName && (
                        <div><strong>Submitted by:</strong> {image.userName}</div>
                      )}
                      {image.userRole && (
                        <div><strong>Role:</strong> {image.userRole}</div>
                      )}
                      {image.location && (
                        <div><strong>Location:</strong> {image.location}</div>
                      )}
                      {(image.upload_date || image.submissionDate) && (
                        <div><strong>Date:</strong> {new Date(image.upload_date || image.submissionDate || '').toLocaleDateString()}</div>
                      )}
                      {image.allegedVariety && (
                        <div><strong>Alleged Variety:</strong> {image.allegedVariety}</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3">
                    <h6 className="font-medium text-green-800 mb-2">Detection Summary</h6>
                    <div className="text-sm text-green-600 space-y-1">
                      <div><strong>Total Beans:</strong> {beans.length}</div>
                      <div><strong>Validated:</strong> {validatedCount}</div>
                      <div><strong>Pending:</strong> {pendingCount}</div>
                    </div>
                  </div>

                  {bestCandidate && userRole === 'farmer' && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h6 className="font-medium text-blue-800 mb-2">Best Candidate for Planting</h6>
                      <div className="text-sm text-blue-600 space-y-1">
                        <div><strong>Bean #{bestCandidate.bean_id}</strong></div>
                        <div>Length: {bestCandidate.length_mm.toFixed(1)} mm</div>
                        <div>Width: {bestCandidate.width_mm.toFixed(1)} mm</div>
                        {bestCandidate.bean_type && (
                          <div>Type: {bestCandidate.bean_type}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="h-96">
                  <h3 className="text-lg font-semibold mb-4">Bean Detection Overview</h3>
                  <BeanDetectionCanvas
                    imageSrc={image.src}
                    beans={beans}
                    selectedBeanId={selectedBeanId}
                    onBeanSelect={setSelectedBeanId}
                    highlightBestCandidate={userRole === 'farmer'}
                    className="h-full border rounded-lg"
                  />
                </div>
              )}

              {activeTab === 'beans' && (
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Bean Visualization */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Bean Visualization</h3>
                    <div className="h-80">
                      <BeanDetectionCanvas
                        imageSrc={image.src}
                        beans={beans}
                        selectedBeanId={selectedBeanId}
                        onBeanSelect={setSelectedBeanId}
                        highlightBestCandidate={userRole === 'farmer'}
                        className="h-full border rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Bean Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Bean Details</h3>
                    {selectedBean ? (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Bean #{selectedBean.bean_id}</h4>
                          {userRole !== 'farmer' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleValidateBean(selectedBean.bean_id, true)}
                                className={`px-3 py-1 text-xs rounded ${
                                  selectedBean.is_validated === true
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                                }`}
                              >
                                Validate
                              </button>
                              <button
                                onClick={() => handleValidateBean(selectedBean.bean_id, false)}
                                className={`px-3 py-1 text-xs rounded ${
                                  selectedBean.is_validated === false
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
                          <div className={`inline-block px-2 py-1 rounded text-sm ${
                            selectedBean.is_validated === true
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
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                        Select a bean from the list to view its details
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'analysis' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Statistical Analysis</h3>
                  {beans.length > 0 ? (
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-800 mb-3">Size Distribution</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Largest Bean:</span>
                            <span className="text-sm font-medium">
                              {Math.max(...beans.map(b => b.length_mm)).toFixed(1)} mm
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Smallest Bean:</span>
                            <span className="text-sm font-medium">
                              {Math.min(...beans.map(b => b.length_mm)).toFixed(1)} mm
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Average Length:</span>
                            <span className="text-sm font-medium">
                              {(beans.reduce((sum, b) => sum + b.length_mm, 0) / beans.length).toFixed(1)} mm
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Average Width:</span>
                            <span className="text-sm font-medium">
                              {(beans.reduce((sum, b) => sum + b.width_mm, 0) / beans.length).toFixed(1)} mm
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-800 mb-3">Validation Status</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Beans:</span>
                            <span className="text-sm font-medium">{beans.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Validated:</span>
                            <span className="text-sm font-medium text-green-600">{validatedCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Pending:</span>
                            <span className="text-sm font-medium text-yellow-600">{pendingCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Validation Rate:</span>
                            <span className="text-sm font-medium">
                              {beans.length > 0 ? ((validatedCount / beans.length) * 100).toFixed(0) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                      No beans detected for analysis
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
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
