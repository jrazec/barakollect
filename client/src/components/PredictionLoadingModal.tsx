import React from 'react';

interface PredictionLoadingModalProps {
  isOpen: boolean;
}

const PredictionLoadingModal: React.FC<PredictionLoadingModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--espresso-black)] rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h3 className="text-lg font-bold text-[var(--espresso-black)] mb-2">
            Processing Image
          </h3>
          <p className="text-gray-600 text-sm">
            Analyzing coffee beans and extracting features...
          </p>
        </div>
        
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-[var(--espresso-black)] rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-[var(--espresso-black)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-[var(--espresso-black)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default PredictionLoadingModal;
