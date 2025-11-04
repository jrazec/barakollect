import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import TabComponent from '@/components/TabComponent';
import GallerySection from './sections/GallerySection';

const FarmerBeansGallery: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Validated');

  return (
      <div className="w-full h-full max-w-6xl bg-white p-6">

        {/* Header */}
        <PageHeader
          title="Beans Gallery"
          subtitle="View your bean samples organized by validation status"
        />
        <TabComponent 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          tabs={['Validated', 'Not Yet Validated']} 
        />
        
        {/* bean images go here */}
        <GallerySection activeTab={activeTab} />

      </div>

  );
};

export default FarmerBeansGallery;
