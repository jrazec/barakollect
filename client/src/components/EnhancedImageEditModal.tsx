import React, { useState } from 'react';
import BeanDetectionCanvas from './BeanDetectionCanvas';
import BeanImageExtractor from './BeanImageExtractor';

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

interface EnhancedImageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: EnhancedImageData;
  userRole?: 'farmer' | 'researcher' | 'admin';
  onValidateBean?: (beanId: number, updatedBean: Partial<BeanDetection>) => void;
}

const EnhancedImageEditModal: React.FC<EnhancedImageEditModalProps> = ({
  isOpen,
  onClose,
  image,
  userRole = 'farmer',
  onValidateBean
}) => {
  const [selectedBeanId, setSelectedBeanId] = useState<number | undefined>();
  const [beans, setBeans] = useState<BeanDetection[]>(image.predictions || []);
  const [editingBean, setEditingBean] = useState<Partial<BeanDetection>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'analysis'>('edit');
  const [showBeanBoxes, setShowBeanBoxes] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!isOpen) return null;

  const selectedBean = beans.find(bean => bean.bean_id === selectedBeanId);

  const handleBeanSelect = (beanId: number) => {
    const bean = beans.find(b => b.bean_id === beanId);
    setSelectedBeanId(beanId);
    if (bean) {
      setEditingBean({
        ...bean,
        bean_type: bean.bean_type || 'Others',
        features: { ...bean.features }
      });
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditingBean(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureChange = (feature: string, value: number) => {
    setEditingBean(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: value
      }
    }));
  };

  const handleValidate = async () => {
    if (!selectedBeanId || !editingBean) return;

    setIsValidating(true);
    try {
      // Create the payload for the API call
      const payload = {
        bean_id: selectedBeanId,
        bean_type: editingBean.bean_type,
        features: editingBean.features,
        is_validated: true
      };

      // Make API call
      const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/beans/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Update local state
        const updatedBeans = beans.map(bean => 
          bean.bean_id === selectedBeanId 
            ? { ...bean, ...editingBean, is_validated: true }
            : bean
        );
        setBeans(updatedBeans);

        // Call parent callback if provided
        if (onValidateBean) {
          onValidateBean(selectedBeanId, { ...editingBean, is_validated: true });
        }

        // Show success feedback (you could add a toast notification here)
        console.log('Bean validated successfully');
      } else {
        console.error('Failed to validate bean');
      }
    } catch (error) {
      console.error('Error validating bean:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const beanTypeOptions = [
    'Alleged Liberica',
    'Alleged Excelsa',
    'Others'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-7xl max-h-[95vh] overflow-hidden w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Edit Bean Analysis
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {beans.length} beans detected • Select a bean to edit
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
                onClick={() => setActiveTab('edit')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'edit'
                    ? 'border-[var(--espresso-black)] text-[var(--espresso-black)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Edit Beans ({beans.length})
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
            {activeTab === 'edit' && (
              <div className="space-y-6">
                {/* Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg">
                  {/* Bean Selector Dropdown */}
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Select Bean:</label>
                    <select
                      value={selectedBeanId || ''}
                      onChange={(e) => {
                        const beanId = e.target.value ? parseInt(e.target.value) : undefined;
                        setSelectedBeanId(beanId);
                        if (beanId) {
                          handleBeanSelect(beanId);
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-48"
                    >
                      <option value="">Select a bean to edit...</option>
                      {beans.map((bean) => (
                        <option key={bean.bean_id} value={bean.bean_id}>
                          Bean #{bean.bean_id} - {bean.length_mm.toFixed(1)}×{bean.width_mm.toFixed(1)}mm
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
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Bean Visualization</h3>
                    <div className="h-96 md:h-[500px]">
                      <BeanDetectionCanvas
                        imageSrc={image.src}
                        beans={beans}
                        selectedBeanId={selectedBeanId}
                        onBeanSelect={setSelectedBeanId}
                        highlightBestCandidate={false}
                        showBeanBoxes={showBeanBoxes}
                        zoomLevel={zoomLevel}
                        showZoomControls={true}
                        onZoomChange={setZoomLevel}
                        className="h-full border rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Bean Edit Form */}
                  <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold mb-4">Bean Details</h3>
                    {beans.find(bean => bean.bean_id === selectedBeanId) && editingBean ? (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Bean #{beans.find(bean => bean.bean_id === selectedBeanId)?.bean_id}</h4>
                          <button
                            onClick={handleValidate}
                            disabled={isValidating}
                            className={`px-4 py-2 rounded ${
                              isValidating 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-500 hover:bg-green-600'
                            } text-white transition-colors`}
                          >
                            {isValidating ? 'Validating...' : 'Validate'}
                          </button>
                        </div>

                        {/* Read-only Length and Width */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Longest Side (Read-only)
                            </label>
                            <input
                              type="text"
                              value={`${beans.find(bean => bean.bean_id === selectedBeanId)?.length_mm.toFixed(2)} mm`}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Shortest Side (Read-only)
                            </label>
                            <input
                              type="text"
                              value={`${beans.find(bean => bean.bean_id === selectedBeanId)?.width_mm.toFixed(2)} mm`}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                            />
                          </div>
                        </div>

                        {/* Bean Type Dropdown */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bean Type
                          </label>
                          <select
                            value={editingBean.bean_type || 'Others'}
                            onChange={(e) => handleFieldChange('bean_type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {beanTypeOptions.map(option => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Validation Status */}
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Validation Status</div>
                          <div className={`inline-block px-2 py-1 rounded text-sm ${
                            beans.find(bean => bean.bean_id === selectedBeanId)?.is_validated === true
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {beans.find(bean => bean.bean_id === selectedBeanId)?.is_validated === true ? 'Validated' : 'Pending Validation'}
                          </div>
                        </div>

                        {/* Additional Measurements - Editable */}
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <h6 className="font-medium text-blue-800 mb-3">Additional Measurements</h6>
                          <div className="grid grid-cols-1 gap-3 text-sm">
                            <div>
                              <label className="block font-medium text-blue-700 mb-1">Area (mm²)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={editingBean.features?.area_mm2 || ''}
                                onChange={(e) => handleFeatureChange('area_mm2', parseFloat(e.target.value))}
                                className="w-full px-2 py-1 border rounded text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-blue-700 mb-1">Perimeter (mm)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={editingBean.features?.perimeter_mm || ''}
                                onChange={(e) => handleFeatureChange('perimeter_mm', parseFloat(e.target.value))}
                                className="w-full px-2 py-1 border rounded text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-blue-700 mb-1">Major Axis (mm)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={editingBean.features?.major_axis_length_mm || ''}
                                onChange={(e) => handleFeatureChange('major_axis_length_mm', parseFloat(e.target.value))}
                                className="w-full px-2 py-1 border rounded text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-blue-700 mb-1">Minor Axis (mm)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={editingBean.features?.minor_axis_length_mm || ''}
                                onChange={(e) => handleFeatureChange('minor_axis_length_mm', parseFloat(e.target.value))}
                                className="w-full px-2 py-1 border rounded text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-blue-700 mb-1">Extent</label>
                              <input
                                type="number"
                                step="0.001"
                                value={editingBean.features?.extent || ''}
                                onChange={(e) => handleFeatureChange('extent', parseFloat(e.target.value))}
                                className="w-full px-2 py-1 border rounded text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-blue-700 mb-1">Eccentricity</label>
                              <input
                                type="number"
                                step="0.001"
                                value={editingBean.features?.eccentricity || ''}
                                onChange={(e) => handleFeatureChange('eccentricity', parseFloat(e.target.value))}
                                className="w-full px-2 py-1 border rounded text-gray-900"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                        Select a bean from the dropdown to edit its details
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
                            <span className="text-lg font-bold text-green-600">{beans.filter(bean => bean.is_validated === true).length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-green-700 font-medium">Pending:</span>
                            <span className="text-lg font-bold text-yellow-600">{beans.filter(bean => bean.is_validated === false || bean.is_validated === null || bean.is_validated === undefined).length}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bean Specimens */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Bean Specimens
                      </h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Largest Bean */}
                        {(() => {
                          const largestBean = beans.reduce((prev, current) => 
                            (prev.features?.area_mm2 > current.features?.area_mm2) ? prev : current
                          );
                          return (
                            <div className="bg-white rounded-xl p-6 border-2 border-green-200">
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="font-semibold text-green-800">Largest Bean #{largestBean.bean_id}</h5>
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  LARGEST
                                </span>
                              </div>
                              <div className="bg-gray-100 rounded-lg p-4 mb-4 min-h-32 flex items-center justify-center">
                                <BeanImageExtractor bean={largestBean} imageSrc={image.src} />
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="text-center">
                                  <div className="text-gray-600">Longest Side</div>
                                  <div className="font-bold text-lg text-green-700">{largestBean.length_mm.toFixed(1)} mm</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-600">Shortest Side</div>
                                  <div className="font-bold text-lg text-green-700">{largestBean.width_mm.toFixed(1)} mm</div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Smallest Bean */}
                        {(() => {
                          const smallestBean = beans.reduce((prev, current) => 
                            (prev.features?.area_mm2 < current.features?.area_mm2) ? prev : current
                          );
                          return (
                            <div className="bg-white rounded-xl p-6 border-2 border-orange-200">
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="font-semibold text-orange-800">Smallest Bean #{smallestBean.bean_id}</h5>
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                                  SMALLEST
                                </span>
                              </div>
                              <div className="bg-gray-100 rounded-lg p-4 mb-4 min-h-32 flex items-center justify-center">
                                <BeanImageExtractor bean={smallestBean} imageSrc={image.src} />
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="text-center">
                                  <div className="text-gray-600">Longest Side</div>
                                  <div className="font-bold text-lg text-orange-700">{smallestBean.length_mm.toFixed(1)} mm</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-600">Shortest Side</div>
                                  <div className="font-bold text-lg text-orange-700">{smallestBean.width_mm.toFixed(1)} mm</div>
                                </div>
                              </div>
                            </div>
                          );
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
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {beans.length} beans • Select and edit bean details
          </div>
          <div className="flex space-x-3">
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

export default EnhancedImageEditModal;