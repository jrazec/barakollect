import React from 'react';

interface PredictionFeatures {
  [key: string]: any;
}

interface PredictionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  processedImage: string; // Base64 string
  features: PredictionFeatures;
}

const PredictionResultModal: React.FC<PredictionResultModalProps> = ({
  isOpen,
  onClose,
  processedImage,
  features
}) => {
  const [imageLoading, setImageLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);

  // Reset image states when modal opens or processedImage changes
  React.useEffect(() => {
    if (isOpen && processedImage) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [isOpen, processedImage]);

  if (!isOpen) return null;

  const imageUrl = `${processedImage}`;
  
  console.log('Backend URL:', import.meta.env.VITE_HOST_BE);
  console.log('Processed Image Path:', processedImage);
  console.log('Final Image URL:', imageUrl);
  console.log('Features:', features);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    console.error('Failed to load image:', imageUrl);
  };

  const renderFeatureValue = (value: any): string => {
    if (typeof value === 'number') {
      return value.toFixed(3);
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[var(--espresso-black)]">
            Prediction Results
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Processed Image */}
          <div>
            <h4 className="text-md font-semibold text-[var(--espresso-black)] mb-3">
              Processed Image
            </h4>
            <div className="border rounded-lg overflow-hidden">
              {imageLoading && (
                <div className="w-full h-96 flex items-center justify-center bg-gray-100">
                  <div className="text-gray-500">Loading image...</div>
                </div>
              )}
              {imageError && (
                <div className="w-full h-96 flex flex-col items-center justify-center bg-gray-100">
                  <div className="text-red-500 mb-2">Failed to load image</div>
                  <div className="text-xs text-gray-500 px-4 text-center">
                    URL: {imageUrl}
                  </div>
                </div>
              )}
              <img
                src={imageUrl}
                alt="Processed bean analysis"
                className={`w-full h-auto object-contain max-h-96 ${imageLoading || imageError ? 'hidden' : ''}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
          </div>
          
          {/* Features */}
          <div>
            <h4 className="text-md font-semibold text-[var(--espresso-black)] mb-3">
              Extracted Features
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              {Object.keys(features).length === 0 ? (
                <p className="text-gray-500 italic">No features extracted</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(features).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-200 pb-2 last:border-b-0">
                      <div className="font-medium text-[var(--espresso-black)] text-sm capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-gray-700 text-sm font-mono mt-1">
                        {renderFeatureValue(value)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
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

export default PredictionResultModal;
