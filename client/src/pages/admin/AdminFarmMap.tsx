import React from 'react';
import AdminMapSection from './sections/AdminMapSection';
import PageHeader from '@/components/PageHeader';

const AdminFarmMap: React.FC = () => {
  return (
      <div className="w-full h-full max-w-7xl bg-white p-6 mx-auto">
         {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <PageHeader title="Farm Management & GIS Mapping" subtitle={''} />
        </div>
        {/* Map Section */}
        <AdminMapSection />
      </div>
  );
};

export default AdminFarmMap;
