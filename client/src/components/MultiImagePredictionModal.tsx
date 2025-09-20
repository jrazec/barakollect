import React, { useState } from 'react';
import type { MultiImageProcessingResponse } from '@/interfaces/global';

interface MultiImagePredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: MultiImageProcessingResponse | null;
}

const MultiImagePredictionModal: React.FC<MultiImagePredictionModalProps> = ({
  isOpen,
  onClose,
  results
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedBeanIndex, setSelectedBeanIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  if (!isOpen || !results) return null;

  const selectedImage = results.images[selectedImageIndex];
  const selectedBean = selectedImage?.beans[selectedBeanIndex];

  const renderFeatureValue = (value: any): string => {
    if (typeof value === 'number') {
      return value.toFixed(3);
    }
    return String(value);
  };

  const getImageUrl = (path: string) => {
    return `${path}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-7xl max-h-[95vh] overflow-hidden w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-xl font-bold text-[var(--espresso-black)]">
              Bean Analysis Results
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {results.total_images_processed} images processed • {results.total_beans_detected} beans detected
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="flex h-[calc(95vh-80px)]">
          {/* Left Panel - Image Selection */}
          <div className="w-80 border-r bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Images ({results.images.length})</h4>
              <div className="space-y-2">
                {results.images.map((image, index) => (
                  <div
                    key={image.image_id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedImageIndex === index
                        ? 'bg-[var(--espresso-black)] text-white'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setSelectedBeanIndex(0);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Image {index + 1}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        image.error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {image.error ? 'Error' : `${image.total_beans_detected} beans`}
                      </span>
                    </div>
                    {image.error && (
                      <p className="text-xs mt-1 opacity-75">{image.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedImage?.error ? (
              <div className="p-6 text-center">
                <div className="text-red-500 text-lg font-semibold mb-2">
                  Processing Error
                </div>
                <p className="text-gray-600">{selectedImage.error}</p>
              </div>
            ) : (
              <div className="p-6">
                {/* Tab Navigation */}
                <div className="flex mb-6 border-b">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'overview'
                        ? 'border-b-2 border-[var(--espresso-black)] text-[var(--espresso-black)]'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'details'
                        ? 'border-b-2 border-[var(--espresso-black)] text-[var(--espresso-black)]'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Bean Details
                  </button>
                </div>

                {activeTab === 'overview' && selectedImage && (
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Image with Detection */}
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-3">Detection Results</h5>
                      <div className="border rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={getImageUrl(selectedImage.debug_images.debug)}
                          alt="Bean detection results"
                          className="w-full h-auto object-contain max-h-96"
                          onError={(e) => {
                            // Fallback to processed image if debug image fails
                            e.currentTarget.src = getImageUrl(selectedImage.debug_images.processed);
                          }}
                        />
                      </div>
                    </div>

                    {/* Summary Information */}
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-3">Analysis Summary</h5>
                      <div className="space-y-4">
                        {/* Image Info */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h6 className="font-medium text-gray-800 mb-2">Image Information</h6>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Dimensions: {selectedImage.image_dimensions_mm.width.toFixed(1)} × {selectedImage.image_dimensions_mm.height.toFixed(1)} mm</div>
                            <div>Resolution: {selectedImage.calibration.mm_per_pixel.toFixed(4)} mm/pixel</div>
                            <div>Marker Size: {selectedImage.calibration.marker_size_mm} mm</div>
                          </div>
                        </div>

                        {/* Bean Count */}
                        <div className="bg-green-50 rounded-lg p-4">
                          <h6 className="font-medium text-green-800 mb-2">Detection Results</h6>
                          <div className="text-2xl font-bold text-green-600">
                            {selectedImage.total_beans_detected} bean{selectedImage.total_beans_detected !== 1 ? 's' : ''} detected
                          </div>
                        </div>

                        {/* Bean Size Summary */}
                        {selectedImage.beans.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h6 className="font-medium text-blue-800 mb-2">Size Summary</h6>
                            <div className="text-sm text-blue-600 space-y-1">
                              <div>Largest: {Math.max(...selectedImage.beans.map(b => b.length_mm)).toFixed(1)} mm</div>
                              <div>Smallest: {Math.min(...selectedImage.beans.map(b => b.length_mm)).toFixed(1)} mm</div>
                              <div>Average: {(selectedImage.beans.reduce((sum, b) => sum + b.length_mm, 0) / selectedImage.beans.length).toFixed(1)} mm</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'details' && selectedImage && selectedImage.beans.length > 0 && (
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Bean Selection */}
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-3">
                        Select Bean ({selectedImage.beans.length} total)
                      </h5>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {selectedImage.beans.map((bean, index) => (
                          <div
                            key={bean.bean_id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedBeanIndex === index
                                ? 'bg-[var(--espresso-black)] text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            onClick={() => setSelectedBeanIndex(index)}
                          >
                            <div className="font-medium">Bean {bean.bean_id}</div>
                            <div className="text-sm opacity-75">
                              {bean.length_mm.toFixed(1)} × {bean.width_mm.toFixed(1)} mm
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bean Visualization */}
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-3">Bean Position</h5>
                      <div className="border rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={getImageUrl(selectedImage.debug_images.debug)}
                          alt="Bean positions"
                          className="w-full h-auto object-contain max-h-64"
                        />
                      </div>
                      {selectedBean?.comment && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                          <h6 className="font-medium text-yellow-800 mb-1">Comment</h6>
                          <p className="text-sm text-yellow-700">{selectedBean.comment}</p>
                        </div>
                      )}
                    </div>

                    {/* Bean Features */}
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-3">Bean Features</h5>
                      {selectedBean && (
                        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm font-medium text-gray-700">Length</div>
                                <div className="text-lg font-semibold text-gray-900">{selectedBean.length_mm.toFixed(2)} mm</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700">Width</div>
                                <div className="text-lg font-semibold text-gray-900">{selectedBean.width_mm.toFixed(2)} mm</div>
                              </div>
                            </div>
                            
                            <hr className="border-gray-200" />
                            
                            {Object.entries(selectedBean.features).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center py-1">
                                <div className="text-sm font-medium text-gray-700 capitalize">
                                  {key.replace(/_/g, ' ')}
                                </div>
                                <div className="text-sm text-gray-600 font-mono">
                                  {renderFeatureValue(value)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
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

export default MultiImagePredictionModal;
