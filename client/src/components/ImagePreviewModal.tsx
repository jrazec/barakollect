import React from 'react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  images: File[];
  onClose: () => void;
  onConfirm: () => void;
  onRemoveImage: (index: number) => void;
  isLoading?: boolean;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  images,
  onClose,
  onConfirm,
  onRemoveImage,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[var(--espresso-black)]">
            Preview Images ({images.length}/5)
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(image)}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded border"
              />
              <button
                onClick={() => onRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                disabled={isLoading}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[var(--espresso-black)] text-white rounded hover:bg-opacity-90 disabled:opacity-50"
            disabled={isLoading || images.length === 0}
          >
            {isLoading ? 'Sending...' : `Send ${images.length} Image${images.length > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
