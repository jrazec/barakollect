import React from 'react';

interface UploadHeaderProps {
  title: string;
  subtitle: string;
}

const UploadHeader: React.FC<UploadHeaderProps> = ({ title, subtitle }) => (
  <div className="mb-2">
    <h1 className="text-2xl font-bold font-main text-[var(--espresso-black)]">{title}</h1>
    <p className="text-sm font-accent text-[var(--espresso-black)]">{subtitle}</p>
  </div>
);

export default UploadHeader;