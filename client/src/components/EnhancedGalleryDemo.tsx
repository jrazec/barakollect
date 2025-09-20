import React, { useState } from 'react';
import EnhancedImageDetailsModal from './EnhancedImageDetailsModal';

// Demo component to test the enhanced gallery functionality
const EnhancedGalleryDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data similar to backend structure
  const mockImageData = {
    id: "demo-image-1",
    src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600",
    userName: "John Farmer",
    userRole: "farmer" as const,
    location: "Highland Coffee Farm",
    upload_date: "2024-01-15",
    allegedVariety: "Arabica Premium",
    predictions: [
      {
        bean_id: 1,
        is_validated: true,
        bean_type: "Arabica",
        confidence: 0.89,
        length_mm: 12.5,
        width_mm: 8.2,
        bbox: [100, 120, 80, 120] as [number, number, number, number],
        comment: "High quality bean",
        detection_date: "2024-01-15"
      },
      {
        bean_id: 2,
        is_validated: false,
        bean_type: "Arabica",
        confidence: 0.76,
        length_mm: 11.8,
        width_mm: 7.9,
        bbox: [200, 150, 85, 115] as [number, number, number, number],
        comment: "Good quality",
        detection_date: "2024-01-15"
      },
      {
        bean_id: 3,
        is_validated: true,
        bean_type: "Arabica",
        confidence: 0.92,
        length_mm: 13.1,
        width_mm: 8.5,
        bbox: [50, 250, 90, 125] as [number, number, number, number],
        comment: "Excellent specimen - largest bean",
        detection_date: "2024-01-15"
      },
      {
        bean_id: 4,
        is_validated: null,
        bean_type: "Arabica",
        confidence: 0.68,
        length_mm: 10.2,
        width_mm: 7.1,
        bbox: [320, 180, 75, 105] as [number, number, number, number],
        comment: "Small but well-formed",
        detection_date: "2024-01-15"
      }
    ]
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Enhanced Gallery Demo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Demo Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <img
            src={mockImageData.src}
            alt="Demo coffee beans"
            className="w-full h-48 object-cover cursor-pointer hover:opacity-90"
            onClick={() => setIsModalOpen(true)}
          />
          <div className="p-4">
            <h3 className="font-semibold text-gray-900">Coffee Bean Analysis</h3>
            <p className="text-sm text-gray-600 mt-1">
              {mockImageData.predictions.length} beans detected • 
              {mockImageData.predictions.filter(p => p.is_validated === true).length} validated
            </p>
            <p className="text-xs text-gray-500 mt-2">
              From: {mockImageData.userName} • {mockImageData.location}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-3 w-full bg-[var(--espresso-black)] text-white py-2 px-4 rounded hover:bg-opacity-90 transition-colors"
            >
              View Bean Analysis
            </button>
          </div>
        </div>

        {/* Feature List */}
        <div className="md:col-span-2 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Enhanced Gallery Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Bean Detection Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Bounding box visualization</li>
                <li>• Bean ID labeling</li>
                <li>• Bean type classification</li>
                <li>• Confidence scores</li>
                <li>• Validation status indicators</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Interactive Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Click to select individual beans</li>
                <li>• Best candidate highlighting (farmers)</li>
                <li>• Validation controls (researchers/admin)</li>
                <li>• Detailed measurements and analysis</li>
                <li>• Statistical overview</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      <EnhancedImageDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        image={mockImageData}
        userRole="farmer"
        onValidateBean={(beanId, validated) => {
          console.log(`Bean ${beanId} validation status set to:`, validated);
          // In real implementation, this would call the backend API
        }}
      />
    </div>
  );
};

export default EnhancedGalleryDemo;
