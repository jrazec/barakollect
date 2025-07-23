import React, { useState } from 'react';
import PageContainer from './PageContainer';
import UploadHeader from './UploadHeader';
import UploadActionsRow from './UploadActionsRow';
import UploadBodySection from './UploadBodySection';

const UploadSamples: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Predict Image');

  const handleFiles = (files: FileList) => {
    console.log('Selected files:', files);
  };

  return (
    <PageContainer>
      <div className="w-full max-w-6xl bg-[var(--mocha-beige)] rounded-xl shadow p-6">
        <UploadHeader
          title="Upload Bean Images"
          subtitle="Upload coffee bean images for analysis and contribute to our research database"
        />
        <UploadActionsRow activeTab={activeTab} onTabChange={setActiveTab} />
        <UploadBodySection activeTab={activeTab} onFilesSelected={handleFiles} />
      </div>
    </PageContainer>
  );
};

export default UploadSamples;