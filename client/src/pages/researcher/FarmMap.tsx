import React from 'react';
import GeographicMapSection from './sections/GeographicMapSection';
import PageHeader from '@/components/PageHeader';

const FarmMap: React.FC = () => {
  return (
    <div className="w-full h-[calc(100vh-6rem)] bg-white">
      <div className="h-full flex flex-col">
        <PageHeader 
          title="Geographic Distribution" 
          subtitle="Visualize the geographical distribution of coffee bean samples across different farms and regions."
        />
        <div className="flex-1 p-6 pt-2">
          <GeographicMapSection />
        </div>
      </div>
    </div>
  );
};

export default FarmMap;
