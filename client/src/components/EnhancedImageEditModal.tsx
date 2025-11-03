import React, { useState, useEffect } from 'react';
import BeanDetectionCanvas from './BeanDetectionCanvas';
import BeanImageExtractor from './BeanImageExtractor';
import { useAuth } from '@/contexts/AuthContext';
import useNotification from '@/hooks/useNotification';
import NotificationModal from '@/components/ui/NotificationModal';

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
    extracted_feature_id?: number;
    prediction_id?: number;
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
  onValidateBean: (beanId: number, updatedBean: Partial<BeanDetection>) => void;
}

const EnhancedImageEditModal: React.FC<EnhancedImageEditModalProps> = ({
  isOpen,
  onClose,
  image,
  userRole = 'farmer',
  onValidateBean
}) => {
  const { user, role } = useAuth(); // Add useAuth hook
  const [selectedBeanId, setSelectedBeanId] = useState<number | undefined>();
  const [beans, setBeans] = useState<BeanDetection[]>(image.predictions || []);
  const [editingBean, setEditingBean] = useState<Partial<BeanDetection>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'analysis'>('edit');
  const [showBeanBoxes, setShowBeanBoxes] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const { showSuccess, showError } = useNotification();
  
  // Debug log for initial data
  useEffect(() => {
    console.log('Initial image.predictions:', image.predictions);
    console.log('Initial beans state:', beans);
    if (beans.length > 0) {
      console.log('Sample bean features:', beans[0].features);
    }
  }, [image.predictions, beans]);

  // Update beans state when image changes
  useEffect(() => {
    setBeans(image.predictions || []);
    setSelectedBeanId(undefined); // Reset selected bean when image changes
    setEditingBean({}); // Clear editing state
  }, [image.id, image.predictions]); // Re-run when image ID or predictions change

  // Debug useEffect to track editingBean changes
  useEffect(() => {
    console.log('editingBean updated:', editingBean);
    console.log('editingBean.features:', editingBean.features);
  }, [editingBean]);

  // Early return after all hooks are defined
  if (!isOpen) return null;

  const handleBeanSelect = (beanId: number) => {
    const bean = beans.find(b => b.bean_id === beanId);
    console.log('Selected bean:', bean); // Debug log
    console.log('Bean features:', bean?.features); // Debug log
    setSelectedBeanId(beanId);
    if (bean) {
      // Map backend feature names to frontend expectations
      const mappedFeatures = bean.features ? {
        area_mm2: bean.features.area,
        perimeter_mm: bean.features.perimeter,
        major_axis_length_mm: bean.features.major_axis_length,
        minor_axis_length_mm: bean.features.minor_axis_length,
        extent: bean.features.extent,
        eccentricity: bean.features.eccentricity,
        convex_area: bean.features.convex_area,
        solidity: bean.features.solidity,
        mean_intensity: bean.features.mean_intensity,
        equivalent_diameter_mm: bean.features.equivalent_diameter,
        // Keep original names as fallback
        ...bean.features
      } : {};
      
      const editingBeanData = {
        ...bean,
        bean_type: bean.bean_type || 'Others',
        features: mappedFeatures
      };
      console.log('Setting editingBean to:', editingBeanData); // Debug log
      setEditingBean(editingBeanData);
      
      // Auto-zoom and center on the selected bean
      if (bean.bbox && bean.bbox.length === 4) {
        // Calculate appropriate zoom level based on bean size
        const [, , width, height] = bean.bbox;
        const beanArea = width * height;
        // Set zoom level between 2-4 based on bean size (smaller beans get higher zoom)
        const autoZoom = Math.max(2, Math.min(4, 8000 / Math.sqrt(beanArea)));
        setZoomLevel(autoZoom);
        console.log(`Auto-zooming to ${autoZoom}x and centering on bean #${beanId}`);
      }
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditingBean(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureChange = (feature: string, value: number | null) => {
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
      // Create the payload for the API call with proper feature mapping
      const featuresPayload = editingBean.features ? {
        area: editingBean.features.area_mm2 || editingBean.features.area,
        perimeter: editingBean.features.perimeter_mm || editingBean.features.perimeter,
        length_mm: editingBean.length_mm,
        width_mm: editingBean.width_mm,
        aspect_ratio: editingBean.features.aspect_ratio,
        circularity: editingBean.features.circularity,
        convexity: editingBean.features.convexity,
        solidity: editingBean.features.solidity,
        extent: editingBean.features.extent,
        compactness: editingBean.features.compactness,
        // Include original feature names as well
        ...editingBean.features
      } : {};
      
      const payload = {
        bean_id: selectedBeanId,
        bean_type: editingBean.bean_type,
        features: featuresPayload,
        extracted_feature_id: editingBean.extracted_feature_id,
        prediction_id: editingBean.prediction_id,
        is_validated: true,
        image_id: image.id,  // Include image ID to uniquely identify the bean
        annotated_by: user ? {
          id: user.id,
          name: user.name,
          role: role
        } : undefined
      };
      console.log('Validation Payload:', payload);

      // Make API call
      try {
        await onValidateBean(selectedBeanId, { ...editingBean, is_validated: true });

        // Update local state
        const updatedBeans = beans.map(bean => 
          bean.bean_id === selectedBeanId 
            ? { ...bean, ...editingBean, is_validated: true }
            : bean
        );
        setBeans(updatedBeans);

        // Show Modal that says success validation
        showSuccess("Success", `Bean has been validated successfully.`);

      } catch (validationError) {
        console.error('Failed to validate bean:', validationError);
        throw validationError; // Re-throw to be caught by outer catch block
      }
    } catch (error) {
      console.error('Error validating bean:', error);
      showError("Validation Failed", `Failed to validate bean. Please try again.`);
    } finally {
      setIsValidating(false);
    }
  };

  const beanTypeOptions = [
    'Alleged Liberica',
    'Alleged Excelsa',
    'Others'
  ];

  // Utility functions for bean analysis
  const findLargestBean = (beans: BeanDetection[]) => {
    return beans.reduce((prev, current) => {
      const prevArea = prev.features?.area || prev.features?.area_mm2 || 0;
      const currentArea = current.features?.area || current.features?.area_mm2 || 0;
      return prevArea > currentArea ? prev : current;
    });
  };

  const findSmallestBean = (beans: BeanDetection[]) => {
    return beans.reduce((prev, current) => {
      const prevArea = prev.features?.area || prev.features?.area_mm2 || 0;
      const currentArea = current.features?.area || current.features?.area_mm2 || 0;
      return prevArea < currentArea ? prev : current;
    });
  };

  const calculateBeanMetrics = (bean: BeanDetection) => {
    return {
      area: bean.features?.area_mm2 || bean.features?.area || 0,
      perimeter: bean.features?.perimeter_mm || bean.features?.perimeter || 0,
      majorAxis: bean.features?.major_axis_length_mm || bean.features?.major_axis_length || 0,
      minorAxis: bean.features?.minor_axis_length_mm || bean.features?.minor_axis_length || 0,
      extent: bean.features?.extent || 0,
      eccentricity: bean.features?.eccentricity || 0
    };
  };

  const getBeanCardStyling = (bean: BeanDetection, largestBeanId: number, smallestBeanId: number) => {
    let cardClass = "bg-white rounded-xl p-4 border-2";
    let badgeText = "";
    let badgeClass = "";

    if (bean.bean_id === largestBeanId) {
      cardClass += " border-green-200";
      badgeText = "LARGEST";
      badgeClass = "bg-green-100 text-green-800";
    } else if (bean.bean_id === smallestBeanId) {
      cardClass += " border-orange-200";
      badgeText = "SMALLEST";
      badgeClass = "bg-orange-100 text-orange-800";
    } else {
      cardClass += " border-gray-200";
    }

    return { cardClass, badgeText, badgeClass };
  };

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
                        focusBeanId={selectedBeanId}
                        className="h-full border rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Bean Edit Form */}
                  <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold mb-4">Bean Details</h3>
                    {selectedBeanId && editingBean && Object.keys(editingBean).length > 0 ? (
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
                                value={editingBean.features?.area_mm2 !== undefined && editingBean.features?.area_mm2 !== null ? editingBean.features.area_mm2 : ''}
                                onChange={(e) => handleFeatureChange('area_mm2', e.target.value ? parseFloat(e.target.value) : null)}
                                className="w-full px-2 py-1 border rounded text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-blue-700 mb-1">Perimeter (mm)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={editingBean.features?.perimeter_mm !== undefined && editingBean.features?.perimeter_mm !== null ? editingBean.features.perimeter_mm : ''}
                                onChange={(e) => handleFeatureChange('perimeter_mm', e.target.value ? parseFloat(e.target.value) : null)}
                                className="w-full px-2 py-1 border rounded text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-blue-700 mb-1">Major Axis (mm)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={editingBean.features?.major_axis_length_mm !== undefined && editingBean.features?.major_axis_length_mm !== null ? editingBean.features.major_axis_length_mm : ''}
                                onChange={(e) => handleFeatureChange('major_axis_length_mm', e.target.value ? parseFloat(e.target.value) : null)}
                                className="w-full px-2 py-1 border rounded text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-blue-700 mb-1">Minor Axis (mm)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={editingBean.features?.minor_axis_length_mm !== undefined && editingBean.features?.minor_axis_length_mm !== null ? editingBean.features.minor_axis_length_mm : ''}
                                onChange={(e) => handleFeatureChange('minor_axis_length_mm', e.target.value ? parseFloat(e.target.value) : null)}
                                className="w-full px-2 py-1 border rounded text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-blue-700 mb-1">Extent</label>
                              <input
                                type="number"
                                step="0.001"
                                value={editingBean.features?.extent !== undefined && editingBean.features?.extent !== null ? editingBean.features.extent : ''}
                                onChange={(e) => handleFeatureChange('extent', e.target.value ? parseFloat(e.target.value) : null)}
                                className="w-full px-2 py-1 border rounded text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-blue-700 mb-1">Eccentricity</label>
                              <input
                                type="number"
                                step="0.001"
                                value={editingBean.features?.eccentricity !== undefined && editingBean.features?.eccentricity !== null ? editingBean.features.eccentricity : ''}
                                onChange={(e) => handleFeatureChange('eccentricity', e.target.value ? parseFloat(e.target.value) : null)}
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
                              {Math.max(...beans.map(b => b.features?.area || b.features?.area_mm2 || 0)).toFixed(1)} mm²
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-700 font-medium">Smallest Bean:</span>
                            <span className="text-lg font-bold text-blue-900">
                              {Math.min(...beans.map(b => b.features?.area || b.features?.area_mm2 || 0)).toFixed(1)} mm²
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

                    {/* All Bean Specimens */}
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
                          const largestBean = findLargestBean(beans);
                          const smallestBean = findSmallestBean(beans);
                          const largestBeanId = largestBean?.bean_id || 0;
                          const smallestBeanId = smallestBean?.bean_id || 0;

                          return beans.map((bean) => {
                            const metrics = calculateBeanMetrics(bean);
                            const styling = getBeanCardStyling(bean, largestBeanId, smallestBeanId);

                            return (
                              <div key={bean.bean_id} className={styling.cardClass}>
                                <div className="flex items-center justify-between mb-4">
                                  <h5 className="font-semibold text-gray-800">Bean #{bean.bean_id}</h5>
                                  <div className="flex items-center space-x-2">
                                    {styling.badgeText && (
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styling.badgeClass}`}>
                                        {styling.badgeText}
                                      </span>
                                    )}
                                    <div className={`px-2 py-1 rounded text-xs ${
                                      bean.is_validated === true
                                        ? 'bg-green-100 text-green-800'
                                        : bean.is_validated === false
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {bean.is_validated === true ? 'Validated' :
                                        bean.is_validated === false ? 'Pending' : 'Unknown'}
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-gray-100 rounded-lg p-4 mb-4 min-h-32 flex items-center justify-center">
                                  <BeanImageExtractor bean={bean} imageSrc={image.src} />
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                  <div className="text-center">
                                    <div className="text-gray-600">Longest Side</div>
                                    <div className="font-bold text-lg">{bean.length_mm.toFixed(1)} mm</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-gray-600">Shortest Side</div>
                                    <div className="font-bold text-lg">{bean.width_mm.toFixed(1)} mm</div>
                                  </div>
                                </div>

                                <div className="text-xs text-gray-600 space-y-1">
                                  <div className="flex justify-between">
                                    <span>Area:</span>
                                    <span>{metrics.area.toFixed(1)} mm²</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Perimeter:</span>
                                    <span>{metrics.perimeter.toFixed(1)} mm</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Major Axis:</span>
                                    <span>{metrics.majorAxis.toFixed(1)} mm</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Minor Axis:</span>
                                    <span>{metrics.minorAxis.toFixed(1)} mm</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Extent:</span>
                                    <span>{metrics.extent.toFixed(3)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Eccentricity:</span>
                                    <span>{metrics.eccentricity.toFixed(3)}</span>
                                  </div>
                                </div>

                                <div className="mt-3 pt-3 border-t">
                                  <button
                                    onClick={() => handleBeanSelect(bean.bean_id)}
                                    className={`w-full px-3 py-2 rounded text-sm transition-colors ${
                                      selectedBeanId === bean.bean_id
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                                    }`}
                                  >
                                    {selectedBeanId === bean.bean_id ? 'Selected' : 'Select & Edit'}
                                  </button>
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