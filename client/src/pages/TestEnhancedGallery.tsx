import React from 'react';
import PageContainer from '@/components/PageContainer';
import EnhancedGalleryDemo from '@/components/EnhancedGalleryDemo';

const TestEnhancedGallery: React.FC = () => {
  return (
    <PageContainer>
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enhanced Gallery Test Page
          </h1>
          <p className="text-gray-600 mb-6">
            Testing the new bean detection and validation features for the gallery.
          </p>
          
          <EnhancedGalleryDemo />
        </div>
      </div>
    </PageContainer>
  );
};

export default TestEnhancedGallery;
