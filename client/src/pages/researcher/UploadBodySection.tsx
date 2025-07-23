import React from 'react';

interface UploadBodySectionProps {
  activeTab: string;
  onFilesSelected: (files: FileList) => void;
}

const UploadBodySection: React.FC<UploadBodySectionProps> = ({ activeTab, onFilesSelected }) => {
if (activeTab === 'Predict Image') {
    return (
        <div className="w-full">
            <div
                className="w-full min-h-[10rem] bg-white border border-dashed border-[var(--mocha-beige)] rounded flex flex-col items-center justify-center cursor-pointer mb-2"
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                    e.preventDefault();
                    if (e.dataTransfer.files.length) onFilesSelected(e.dataTransfer.files);
                }}
                onClick={() => document.getElementById('upload-input-predict')?.click()}
            >
                <input
                    id="upload-input-predict"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={e => e.target.files && onFilesSelected(e.target.files)}
                />
                <span className="text-3xl text-[var(--espresso-black)] mb-2">&#8682;</span>
                <span className="text-xs text-[var(--espresso-black)] font-accent">Drop your image here or click to browse</span>
            </div>
        </div>
    );
}

if (activeTab === 'Submit Image') {
    return (
        <div className="w-full">
            <div
                className="w-full min-h-[10rem] bg-white border border-dashed border-[var(--mocha-beige)] rounded flex flex-col items-center justify-center cursor-pointer mb-2"
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                    e.preventDefault();
                    if (e.dataTransfer.files.length) onFilesSelected(e.dataTransfer.files);
                }}
                onClick={() => document.getElementById('upload-input-submit')?.click()}
            >
                <input
                    id="upload-input-submit"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={e => e.target.files && onFilesSelected(e.target.files)}
                />
                <span className="text-3xl text-[var(--espresso-black)] mb-2">&#8682;</span>
                <span className="text-xs text-[var(--espresso-black)] font-accent">Drop your image here or click to browse!</span>
            </div>
        </div>
    );
}
  if (activeTab === 'Find Largest Bean') {
    return (
      <div className="w-full">
        <div className="w-full min-h-[10rem] bg-white border border-dashed border-[var(--mocha-beige)] rounded flex flex-col items-center justify-center mb-2">
          <span className="text-4xl text-[var(--espresso-black)] mb-2">&#128247;</span>
          <div className="font-main font-bold text-[var(--espresso-black)] mb-1">Live Camera View</div>
          <div className="text-xs text-[var(--espresso-black)] font-accent mb-2">Position your coffee beans in the camera view to auto-detect the largest bean.</div>
          <button className="bg-[var(--espresso-black)] text-[var(--parchment)] px-4 py-1 rounded font-main text-xs shadow">Open Camera</button>
        </div>
        <div className="bg-[#FDE9DD] rounded p-2 text-xs text-[var(--espresso-black)] font-accent text-center">
          This feature requires camera access. In a real implementation, this would open your device camera and use computer vision to find the largest bean in view.
        </div>
      </div>
    );
  }
  return null;
};

export default UploadBodySection;