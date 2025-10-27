import React from 'react';
import PageContainer from '../../components/PageContainer';
import GeographicMapSection from './sections/GeographicMapSection';
import ActionFooter from './sections/ActionFooter';

const FarmMap: React.FC = () => {
  return (
    <PageContainer>
      <div className="w-full max-w-6xl bg-white rounded-xl shadow p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-main text-[var(--espresso-black)]">
              Geographic Distribution
            </h1>
            <p className="text-sm font-accent text-[var(--espresso-black)]">
              Visualize the geographical distribution of coffee bean samples across different farms and regions.
            </p>
          </div>
        </div>

        {/* Map and Footer */}
        <GeographicMapSection />
        <ActionFooter />
      </div>
    </PageContainer>
  );
};

export default FarmMap;
