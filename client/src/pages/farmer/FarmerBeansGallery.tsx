import React, { useState } from 'react';
import PageContainer from '../../components/PageContainer';
import PageHeader from '../../components/PageHeader';
import TabComponent from '@/components/TabComponent';
import GallerySection from './sections/GallerySection';

const FarmerBeansGallery: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Predicted Images');

  return (
    <PageContainer>
      <div className="w-full max-w-6xl bg-[var(--mocha-beige)] rounded-xl shadow p-6">

        {/* Header */}
        <PageHeader
          title="Beans Gallery"
          subtitle=""
        />
        <TabComponent activeTab={activeTab} onTabChange={setActiveTab} tabs={['Predicted Images','Submitted Images']} />
        
        {/* bean images go here */}
        <GallerySection activeTab={activeTab} />

      </div>
    </PageContainer>
  );
};

export default FarmerBeansGallery;
