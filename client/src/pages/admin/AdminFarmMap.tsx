import React from 'react';
import PageContainer from '../../components/PageContainer';
import AdminMapSection from './sections/AdminMapSection';

const AdminFarmMap: React.FC = () => {
  return (
    <PageContainer>
      <div className="w-full max-w-6xl bg-[var(--mocha-beige)] rounded-xl shadow p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-main text-[var(--espresso-black)]">
              Farm Management & GIS Mapping
            </h1>
            <p className="text-sm font-accent text-[var(--espresso-black)]">
              Manage farm locations, view analytics, and oversee geographical distribution of coffee farms.
            </p>
          </div>
        </div>

        {/* Map Section */}
        <AdminMapSection />
      </div>
    </PageContainer>
  );
};

export default AdminFarmMap;
