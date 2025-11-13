import React, { useMemo, useState } from 'react';
import BeanDetectionCanvas from './BeanDetectionCanvas';
import BeanImageExtractor from './BeanImageExtractor';
import {
  calculateBeanMetrics,
  findLargestBean,
  findSmallestBean,
  getBeanCardStyling
} from '../utils/beanAnalysisUtils';

const chipBase = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium';
const MorphologyTags: React.FC<{ classification?: BeanClassification | null }> = ({ classification }) => {
  if (!classification) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <span className={`${chipBase} bg-blue-100 text-blue-700`}>
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        Shape: {classification.shape}
      </span>
      <span className={`${chipBase} bg-amber-100 text-amber-700`}>
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        Size: {classification.size}
      </span>
    </div>
  );
};
const ConfidenceBadge: React.FC<{ value?: string | null }> = ({ value }) => {
  if (!value) return null;
  return (
    <span className={`${chipBase} bg-emerald-100 text-emerald-700`}>
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      Confidence: {value}
    </span>
  );
};

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

type BeanClassification = {
  size: string;
  shape: string;
  confidence: number | null;
};

const DEFAULT_SMALL_MAX = 200;
const DEFAULT_MEDIUM_MAX = 400;

const formatConfidence = (confidence?: number | null) => {
  if (confidence === undefined || confidence === null || Number.isNaN(confidence)) {
    return null;
  }
  const normalized = confidence > 1 ? confidence : confidence * 100;
  const bounded = Math.min(Math.max(normalized, 0), 100);
  return `${Math.round(bounded)}%`;
};

const calculatePercentile = (sortedValues: number[], percentile: number) => {
  if (!sortedValues.length) {
    return 0;
  }
  const index = (sortedValues.length - 1) * percentile;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) {
    return sortedValues[lower];
  }
  const fraction = index - lower;
  return sortedValues[lower] + fraction * (sortedValues[upper] - sortedValues[lower]);
};

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!isOpen) return null;

  const beans = image.predictions || [];

  const beanClassifications = useMemo(() => {
    if (!beans.length) {
      return {};
    }

    const areaValues = beans
      .map((bean) => {
        const area = bean.features?.area_mm2 ?? (bean.length_mm && bean.width_mm ? bean.length_mm * bean.width_mm : null);
        return typeof area === 'number' && !Number.isNaN(area) && area > 0 ? area : null;
      })
      .filter((value): value is number => value !== null);

    let smallMax = DEFAULT_SMALL_MAX;
    let mediumMax = DEFAULT_MEDIUM_MAX;

    if (areaValues.length >= 3) {
      const sorted = [...areaValues].sort((a, b) => a - b);
      smallMax = calculatePercentile(sorted, 0.33);
      mediumMax = calculatePercentile(sorted, 0.67);
    }

    const classifySize = (area?: number | null) => {
      if (!area || Number.isNaN(area) || area <= 0) {
        return 'Unclassified';
      }
      if (area < smallMax) {
        return 'Small';
      }
      if (area <= mediumMax) {
        return 'Medium';
      }
      return 'Large';
    };

    const classifyShape = (bean: BeanDetection) => {
      const features = bean.features || {};
      const majorAxis = typeof features.major_axis_length_mm === 'number' ? features.major_axis_length_mm : bean.length_mm;
      const minorAxis = typeof features.minor_axis_length_mm === 'number' ? features.minor_axis_length_mm : bean.width_mm;
      const extent = typeof features.extent === 'number' ? features.extent : null;
      const eccentricity = typeof features.eccentricity === 'number' ? features.eccentricity : null;

      if (!minorAxis || minorAxis <= 0) {
        return 'Unclassified';
      }

      const aspectRatio = majorAxis / minorAxis;
      if (extent === null || eccentricity === null) {
        return aspectRatio < 1.3 ? 'Round' : 'Teardrop';
      }

      const isRound = aspectRatio < 1.5 && eccentricity < 0.8 && extent > 0.75;
      return isRound ? 'Round' : 'Teardrop';
    };

    const normalizeConfidence = (confidence?: number | null) => {
      if (confidence === undefined || confidence === null || Number.isNaN(confidence)) {
        return null;
      }
      const raw = confidence > 1 ? confidence / 100 : confidence;
      return Math.min(Math.max(raw, 0), 1);
    };

    return beans.reduce<Record<number, BeanClassification>>((acc, bean) => {
      const area = typeof bean.features?.area_mm2 === 'number'
        ? bean.features.area_mm2
        : (bean.length_mm && bean.width_mm ? bean.length_mm * bean.width_mm : null);

      acc[bean.bean_id] = {
        size: classifySize(area),
        shape: classifyShape(bean),
        confidence: normalizeConfidence(bean.confidence)
      };
      return acc;
    }, {});
  }, [beans]);

  const getBeanClassification = (beanId: number): BeanClassification =>
    beanClassifications[beanId] || { size: 'Unclassified', shape: 'Unclassified', confidence: null };

  const selectedBean = beans.find(bean => bean.bean_id === selectedBeanId);
  const selectedBeanClassification = selectedBean ? getBeanClassification(selectedBean.bean_id) : null;
  const selectedBeanConfidence = selectedBean
    ? formatConfidence(
      selectedBeanClassification?.confidence ?? selectedBean.confidence
    )
    : null;

  // Find best candidate (largest bean)
  const bestCandidate = beans.length > 0
    ? beans.reduce((prev, current) =>
      (prev.features?.area_mm2 > current.features?.area_mm2) ? prev : current
    )
    : null;
  const bestCandidateClassification = bestCandidate ? getBeanClassification(bestCandidate.bean_id) : null;
  const bestCandidateConfidence = bestCandidate
    ? formatConfidence(
      bestCandidateClassification?.confidence ?? bestCandidate.confidence
    )
    : null;

  const validatedCount = beans.filter(bean => bean.is_validated === true).length;
  const pendingCount = beans.filter(bean => bean.is_validated === false || bean.is_validated === null || bean.is_validated === undefined).length;

  const handleValidateBean = (beanId: number, validated: boolean) => {
    if (onValidateBean) {
      onValidateBean(beanId, validated);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (onDeleteImage && image.id) {
      onDeleteImage(image.id);
      setShowDeleteModal(false);
      onClose();
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50">
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
              className="button-accent text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-50">
          <div className="px-6 mt-2 pb-2 border-b border-gray-300">
            <div className="flex space-x-5 justify-end">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview'
                    ? 'border-[var(--espresso-black)] text-[var(--espresso-black)]'
                    : 'button-secondary'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('beans')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'beans'
                    ? 'border-[var(--espresso-black)] text-[var(--espresso-black)]'
                    : 'button-secondary'
                  }`}
              >
                Bean Details ({beans.length})
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'analysis'
                    ? 'border-[var(--espresso-black)] text-[var(--espresso-black)]'
                    : 'button-secondary'
                  }`}
              >
                Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="h-[calc(95vh-220px)] overflow-y-auto">
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Bean Visualization - Large and Responsive */}
                <div className="w-full">
                  <div className="h-96 md:h-[500px] border-gray-300 border rounded-lg">
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
                        <div className="pt-2 space-y-2">
                          <MorphologyTags classification={bestCandidateClassification} />
                          <ConfidenceBadge value={bestCandidateConfidence} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'beans' && (
              <div className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Bean Visualization - Takes up more space */}
                  <div className="lg:col-span-2 ">

                    {/* Controls */}
                    <div className="flex items-center space-x-4 justify-between mb-2">
                      <h3 className="text-lg font-semibold">Bean Visualization</h3>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Show Bean Boxes:</label>
                        <button
                          onClick={() => setShowBeanBoxes(!showBeanBoxes)}
                          className={`mini-glass !border-[var(--fadin-mocha)] relative inline-flex h-6 w-14 items-center rounded-full transition-colors hover:!shadow-none ${showBeanBoxes ? '!bg-green-200' : '!bg-gray-300'
                            }`}
                        >
                          <span
                            className={`button-accent !bg-white inline-block h-1 w-1 transform rounded-full transition-transform ${showBeanBoxes ? 'translate-x-1' : '-translate-x-3.5'
                              }`}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="h-96 md:h-[500px] border-gray-300 border rounded-lg">
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
                  <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold mb-4">Bean Details</h3>
                    {/* Bean Selector Dropdown */}
                    <div>
                      <label className="text-sm font-medium text-gray-700"></label>
                      <select
                        value={selectedBeanId || ''}
                        onChange={(e) => setSelectedBeanId(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                      >
                        <option value="">Select a bean...</option>
                        {beans.map((bean) => {
                          const classification = getBeanClassification(bean.bean_id);
                          const confidenceLabel = formatConfidence(classification.confidence ?? bean.confidence);
                          return (
                            <option key={bean.bean_id} value={bean.bean_id}>
                              Bean #{bean.bean_id} - {bean.length_mm.toFixed(1)}×{bean.width_mm.toFixed(1)}mm
                              {bean.bean_id === bestCandidate?.bean_id && userRole === 'farmer' ? ' (BEST)' : ''}
                              {confidenceLabel ? ` • ${confidenceLabel}` : ''}
                              {bean.is_validated === true ? ' ✓' : bean.is_validated === false ? ' ⏳' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
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
                            </div>
                            <div className="mt-3 space-y-2">
                              <MorphologyTags classification={selectedBeanClassification} />
                              <ConfidenceBadge value={selectedBeanConfidence} />
                            </div>
                          </div>
                        )}
                        {!selectedBean.bean_type && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-700">Morphological Classification</div>
                            <MorphologyTags classification={selectedBeanClassification} />
                            <ConfidenceBadge value={selectedBeanConfidence} />
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
                            const classification = getBeanClassification(bean.bean_id);
                            const confidenceLabel = formatConfidence(classification.confidence ?? bean.confidence);

                            // Get styling based on bean status
                            const styling = getBeanCardStyling(bean, largestBeanId, smallestBeanId);

                            return (
                              <div key={bean.bean_id} className={styling.cardClass}>
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className={`font-semibold ${styling.headerColor} flex items-center text-sm`}>
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
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
                                <div className="mt-3 border-t border-gray-200 pt-2 text-xs text-gray-600 space-y-2">
                                  <MorphologyTags classification={classification} />
                                  <ConfidenceBadge value={confidenceLabel} />
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
        <div className="flex justify-between items-center p-4 bg-gray-50">
          <div className="text-sm text-gray-600">
            {beans.length} beans • {validatedCount} validated
          </div>
          <div className="flex space-x-3">
            {userRole === 'admin' && onDeleteImage && image.id && (
              <button
                onClick={handleDeleteClick}
                className="px-4 py-2 !bg-red-700 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete Image
              </button>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                  <p className="text-sm text-gray-600">Are you sure you want to delete this image?</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelDelete}
                  className="button-secondary cancel px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="!bg-red-700 px-4 py-2 text-sm font-medium text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedImageDetailsModal;
