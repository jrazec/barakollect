import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import ImagePreviewModal from '../../components/ImagePreviewModal';
import PredictionResultModal from '../../components/PredictionResultModal';
import MultiImagePredictionModal from '../../components/MultiImagePredictionModal';
import PredictionLoadingModal from '../../components/PredictionLoadingModal';
import CameraCapture from '../../components/CameraCapture';
import { supabase } from '../../lib/supabaseClient';
import type { MultiImageProcessingResponse } from '../../interfaces/global';

interface UploadBodySectionProps {
  activeTab: string;
  onFilesSelected: (files: FileList) => void;
}

const UploadBodySection: React.FC<UploadBodySectionProps> = ({ activeTab, onFilesSelected: _ }) => {
  const [uploadMode, setUploadMode] = useState<'camera' | 'file'>('file');
  const [capturedImages, setCapturedImages] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [showPredictionResult, setShowPredictionResult] = useState(false);
  const [showMultiImageResult, setShowMultiImageResult] = useState(false);
  const [predictionData, setPredictionData] = useState<{
    features: any;
    processed_image: string;
  } | null>(null);
  const [multiImageResults, setMultiImageResults] = useState<MultiImageProcessingResponse | null>(null);
  const [comment, setComment] = useState('');

  const handleFileSelect = (files: FileList) => {
    const newFiles = Array.from(files).slice(0, 5 - selectedFiles.length);
    const updatedFiles = [...selectedFiles, ...newFiles].slice(0, 5);
    setSelectedFiles(updatedFiles);
    
    // Auto-trigger modal when 5 images are reached
    if (updatedFiles.length === 5) {
      setShowPreviewModal(true);
    }
  };

  const handleCameraCapture = (file: File) => {
    if (capturedImages.length < 5) {
      const updatedImages = [...capturedImages, file];
      setCapturedImages(updatedImages);
      
      // Auto-trigger modal when 5 images are reached
      if (updatedImages.length === 5) {
        setShowPreviewModal(true);
      }
    }
  };

  const handleConfirmUpload = async () => {
    const imagesToUpload = uploadMode === 'camera' ? capturedImages : selectedFiles;
    if (imagesToUpload.length === 0) return;

    setIsUploading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const user_id = data.session?.user?.id;

      if (!user_id) {
        alert('User not authenticated');
        return;
      }

      let response;
      if (activeTab === 'Predict Image') {
        // Show prediction loading modal
        setIsPredicting(true);
        setShowPreviewModal(false);
        
        response = await storageService.predictImage({
          user_id,
          comment: comment,
          save_to_db: true, // Always save to database for predictions
          ...(imagesToUpload.length === 1 ? { image: imagesToUpload[0] } : { images: imagesToUpload })
        });
        
        setIsPredicting(false);
        
        // Handle new multi-image response structure
        if (response && response.images && response.images.length > 0) {
          console.log('Multi-image prediction response:', response);
          
          // Check if any images were successfully processed
          const successfulImages = response.images.filter(img => !img.error && img.beans.length > 0);
          
          if (successfulImages.length > 0) {
            setMultiImageResults(response);
            setShowMultiImageResult(true);
            
            // Reset state and clear preview images
            setCapturedImages([]);
            setSelectedFiles([]);
            setShowPreviewModal(false);
            setComment('');
            
            // Clear the file input as well
            const fileInput = document.getElementById(`upload-input-${activeTab}`) as HTMLInputElement;
            if (fileInput) {
              fileInput.value = '';
            }
          } else {
            // All images failed or no beans detected
            const errorMessages = response.images.map(img => img.error || 'No beans detected').join(', ');
            alert(`Prediction failed: ${errorMessages}`);
          }
        } else {
          console.error('Prediction response:', response);
          alert('Prediction failed or no results returned');
        }
      } else if (activeTab === 'Submit Image') {
        response = await storageService.submitImage({
          user_id,
          ...(imagesToUpload.length === 1 ? { image: imagesToUpload[0] } : { images: imagesToUpload })
        });
        
        if (response?.success) {
          alert('Images uploaded successfully!');
          // Reset state and clear preview images
          setCapturedImages([]);
          setSelectedFiles([]);
          setShowPreviewModal(false);
          setComment('');
          
          // Clear the file input as well
          const fileInput = document.getElementById(`upload-input-${activeTab}`) as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        }
      }
    } catch (error: any) {
      setIsPredicting(false);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    if (uploadMode === 'camera') {
      setCapturedImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const currentImages = uploadMode === 'camera' ? capturedImages : selectedFiles;

  if (activeTab === 'Predict Image' || activeTab === 'Submit Image') {
    return (
      <div className="w-full">
        {/* Toggle Buttons */}
        <div className="flex mb-4 bg-gray-100 rounded p-1 gap-2">
          <button
            onClick={() => setUploadMode('file')}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
              uploadMode === 'file'
                ? '!bg-[var(--arabica-brown)] !text-white'
                : 'button-secondary'
            }`}
          >
            📁 Select Files
          </button>
          <button
            onClick={() => setUploadMode('camera')}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
              uploadMode === 'camera'
                ? '!bg-[var(--arabica-brown)] !text-white'
                : 'button-secondary'
            }`}
          >
            📷 Take Photos
          </button>
        </div>

        {/* File Upload Mode */}
        {uploadMode === 'file' && (
          <div className="w-full">
            <div
              className="w-full min-h-[10rem] bg-white border border-dashed border-[var(--mocha-beige)] rounded flex flex-col items-center justify-center cursor-pointer mb-2"
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                if (e.dataTransfer.files.length) handleFileSelect(e.dataTransfer.files);
              }}
              onClick={() => document.getElementById(`upload-input-${activeTab}`)?.click()}
            >
              <input
                id={`upload-input-${activeTab}`}
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={e => e.target.files && handleFileSelect(e.target.files)}
              />
              <span className="text-3xl text-[var(--espresso-black)] mb-2">&#8682;</span>
              <span className="text-xs text-[var(--espresso-black)] font-accent">
                Drop your images here or click to browse (Max 5 images) - {selectedFiles.length}/5 selected
              </span>
            </div>
            {selectedFiles.length > 0 && (
              <div className="mb-2">
                <div className="text-sm text-gray-600 mb-2">
                  Selected: {selectedFiles.map(f => f.name).join(', ')}
                </div>
                {activeTab === 'Predict Image' && (
                  <div className="mb-2">
                    <textarea
                      placeholder="Add optional comment for analysis..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm resize-none h-16"
                      maxLength={500}
                    />
                  </div>
                )}
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="w-full bg-[var(--espresso-black)] text-white py-2 rounded font-medium"
                >
                  Preview & Send {selectedFiles.length} Image{selectedFiles.length > 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Camera Mode */}
        {uploadMode === 'camera' && (
          <div className="w-full">
            <div className="w-full min-h-[10rem] bg-white border border-dashed border-[var(--mocha-beige)] rounded flex flex-col items-center justify-center mb-2">
              <span className="text-4xl text-[var(--espresso-black)] mb-2">📷</span>
              <span className="text-xs text-[var(--espresso-black)] font-accent mb-3">
                Take up to 5 photos with your camera
              </span>
              <button
                onClick={() => setShowCamera(true)}
                className="bg-[var(--espresso-black)] text-white px-4 py-2 rounded font-medium"
                disabled={capturedImages.length >= 5}
              >
                {capturedImages.length >= 5 ? 'Max Photos Reached' : `Open Camera (${capturedImages.length}/5)`}
              </button>
            </div>
            
            {capturedImages.length > 0 && (
              <div className="mb-2">
                <div className="text-sm text-gray-600 mb-2">
                  Captured {capturedImages.length} photo{capturedImages.length > 1 ? 's' : ''}
                </div>
                {activeTab === 'Predict Image' && (
                  <div className="mb-2">
                    <textarea
                      placeholder="Add optional comment for analysis..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm resize-none h-16"
                      maxLength={500}
                    />
                  </div>
                )}
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="w-full bg-[var(--espresso-black)] text-white py-2 rounded font-medium"
                >
                  Preview & Send {capturedImages.length} Photo{capturedImages.length > 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Camera Component */}
        {showCamera && (
          <CameraCapture
            onCapture={handleCameraCapture}
            maxPhotos={5}
            currentCount={capturedImages.length}
            onClose={() => setShowCamera(false)}
          />
        )}

        {/* Preview Modal */}
        <ImagePreviewModal
          isOpen={showPreviewModal}
          images={currentImages}
          onClose={() => setShowPreviewModal(false)}
          onConfirm={handleConfirmUpload}
          onRemoveImage={removeImage}
          isLoading={isUploading}
        />

        {/* Prediction Loading Modal */}
        <PredictionLoadingModal isOpen={isPredicting} />

        {/* Prediction Result Modal (Legacy - for old single image results) */}
        <PredictionResultModal
          isOpen={showPredictionResult}
          onClose={() => setShowPredictionResult(false)}
          processedImage={predictionData?.processed_image || ''}
          features={predictionData?.features || {}}
        />

        {/* Multi-Image Prediction Result Modal */}
        <MultiImagePredictionModal
          isOpen={showMultiImageResult}
          onClose={() => setShowMultiImageResult(false)}
          results={multiImageResults}
        />
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