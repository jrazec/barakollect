import React, { useState } from 'react';
import PageContainer from '@/components/PageContainer';
import UploadBodySection from '../pages/researcher/UploadBodySection';
import PageHeader from '@/components/PageHeader';
import TabComponent from '@/components/TabComponent';

const UploadSamples: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Predict Image');

  const handleFiles = (files: FileList) => {
    console.log('Selected files:', files);
  };

  return (
    <PageContainer>
      <div className="w-full max-w-6xl bg-[var(--mocha-beige)] rounded-xl shadow p-6">
        <PageHeader
          title="Upload Bean Images"
          subtitle="Upload coffee bean images for analysis and contribute to our research database"
        />
        <TabComponent activeTab={activeTab} onTabChange={setActiveTab} tabs={['Predict Image','Submit Image','Find Largest Bean']} />
        <UploadBodySection activeTab={activeTab} onFilesSelected={handleFiles} />
      </div>
    </PageContainer>
  );
};

export default UploadSamples;