import React from 'react';
import GeographicMapSection from './sections/GeographicMapSection';
import ActionFooter from './sections/ActionFooter';
import PageHeader from '@/components/PageHeader';

const FarmMap: React.FC = () => {
  return (
    
      <div className="w-full h-full max-w-6xl bg-white p-6">
        {/* Header */}
        <PageHeader title="Geographic Distribution" subtitle={'Visualize the geographical distribution of coffee bean samples across different farms and regions.'} />

        {/* Map and Footer */}
        <GeographicMapSection />
        <ActionFooter />
      </div>
  );
};

export default FarmMap;
