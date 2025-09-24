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

        <div className="flex h-[calc(95vh-100px)]">
          {/* Left Panel - Bean Selection */}
          <div className="w-80 border-r bg-gray-50 overflow-y-auto">
            <div className="p-4">
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
                    onClick={() => handleBeanSelect(bean.bean_id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Bean #{bean.bean_id}</span>
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
                    <div className="text-sm opacity-75 mt-1">
                      {bean.length_mm.toFixed(1)} × {bean.width_mm.toFixed(1)} mm
                    </div>
                    {bean.bean_type && (
                      <div className="text-sm opacity-75">
                        {bean.bean_type}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
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
                      highlightBestCandidate={false}
                      className="h-full border rounded-lg"
                    />
                  </div>
                </div>

                {/* Bean Edit Form */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Bean Details</h3>
                  {selectedBean && editingBean ? (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Bean #{selectedBean.bean_id}</h4>
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
                            Length (Read-only)
                          </label>
                          <input
                            type="text"
                            value={`${selectedBean.length_mm.toFixed(2)} mm`}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Width (Read-only)
                          </label>
                          <input
                            type="text"
                            value={`${selectedBean.width_mm.toFixed(2)} mm`}
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
                          selectedBean.is_validated === true
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedBean.is_validated === true ? 'Validated' : 'Pending Validation'}
                        </div>
                      </div>

                      {/* Additional Measurements - Editable */}
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h6 className="font-medium text-blue-800 mb-3">Additional Measurements</h6>
                        <div className="grid grid-cols-2 gap-3 text-sm">
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
                          <div>
                            <label className="block font-medium text-blue-700 mb-1">Convex Area (mm²)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editingBean.features?.convex_area || ''}
                              onChange={(e) => handleFeatureChange('convex_area', parseFloat(e.target.value))}
                              className="w-full px-2 py-1 border rounded text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-blue-700 mb-1">Solidity</label>
                            <input
                              type="number"
                              step="0.001"
                              value={editingBean.features?.solidity || ''}
                              onChange={(e) => handleFeatureChange('solidity', parseFloat(e.target.value))}
                              className="w-full px-2 py-1 border rounded text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-blue-700 mb-1">Mean Intensity</label>
                            <input
                              type="number"
                              step="0.1"
                              value={editingBean.features?.mean_intensity || ''}
                              onChange={(e) => handleFeatureChange('mean_intensity', parseFloat(e.target.value))}
                              className="w-full px-2 py-1 border rounded text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-blue-700 mb-1">Equivalent Diameter (mm)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editingBean.features?.equivalent_diameter_mm || ''}
                              onChange={(e) => handleFeatureChange('equivalent_diameter_mm', parseFloat(e.target.value))}
                              className="w-full px-2 py-1 border rounded text-gray-900"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                      Select a bean from the list to edit its details
                    </div>
                  )}
                </div>
              </div>
            </div>
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