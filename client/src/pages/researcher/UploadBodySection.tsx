import React, { useEffect, useState } from 'react';
import { storageService } from '../../services/storageService';
import ImagePreviewModal from '../../components/ImagePreviewModal';
import PredictionResultModal from '../../components/PredictionResultModal';
import MultiImagePredictionModal from '../../components/MultiImagePredictionModal';
import PredictionLoadingModal from '../../components/PredictionLoadingModal';
import CameraCapture from '../../components/CameraCapture';
import { supabase } from '../../lib/supabaseClient';
import type { MultiImageProcessingResponse } from '../../interfaces/global';
import useNotification from '@/hooks/useNotification';
import NotificationModal from '@/components/ui/NotificationModal';

interface UploadBodySectionProps {
  activeTab: string;
  onFilesSelected: (files: FileList) => void;
}

const UploadBodySection: React.FC<UploadBodySectionProps> = ({ activeTab, onFilesSelected: _ }) => {
  const [uploadMode, setUploadMode] = useState<'camera' | 'file'>('file');
  const [maxImages, setMaxImages] = useState<number | undefined>(undefined);
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
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  // set max images supabase service
  useEffect(() => {
    const fetchMaxImages = async () => {
      try {
        const limit = await storageService.getMaxUploadImages();
        setMaxImages(limit);
      } catch (error) {
        console.error('Error fetching max upload images:', error);
      }
    };
    fetchMaxImages();
  }, []);
  const handleFileSelect = (files: FileList) => {
    const newFiles = Array.from(files).slice(0, (maxImages ?? 5) - selectedFiles.length);
    const updatedFiles = [...selectedFiles, ...newFiles].slice(0, maxImages ?? 5);
    setSelectedFiles(updatedFiles);

    // Auto-trigger modal when maxImages are reached
    if (updatedFiles.length === maxImages) {
      setShowPreviewModal(true);
    }
  };

  const handleCameraCapture = (file: File) => {
    if (capturedImages.length < (maxImages ?? 5)) {
      const updatedImages = [...capturedImages, file];
      setCapturedImages(updatedImages);

      // Auto-trigger modal when maxImages are reached
      if (updatedImages.length === (maxImages ?? 5)) {
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
        showError("User not authenticated", "Please log in and try again.", { autoClose: false });
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
            showError("Prediction failed", errorMessages, { autoClose: false });
          }
        } else {
          console.error('Prediction response:', response);
          showError("Prediction failed", "No results returned", { autoClose: false });
        }
      } else if (activeTab === 'Submit Image') {
        response = await storageService.submitImage({
          user_id,
          ...(imagesToUpload.length === 1 ? { image: imagesToUpload[0] } : { images: imagesToUpload })
        });
        
        if (response?.success) {
          showSuccess("Images uploaded successfully", "Your images have been uploaded.", { autoClose: false });
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
      showError("Upload failed", error.message, { autoClose: false });
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
      <div className="glass-div w-full p-4 rounded-lg shadow-sm">
        {/* Toggle Buttons */}
        <div className="flex mb-4 bg-gray-100 rounded p-1 gap-2">
          <button
            onClick={() => setUploadMode('file')}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
              uploadMode === 'file'
                ? ''
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

        <p className="text-xs text-gray-600 mb-4">
          Warning, won't be able to delete your image once you upload. If you'd want it removed, kindly email <a href="mailto:barakollect@gmail.com" className="text-[var(--arabica-brown)] underline">barakollect@gmail.com</a> after submission to request deletion.
        </p>

        {/* File Upload Mode */}
        {uploadMode === 'file' && (
          <div className="w-full">
            <div
              className="w-full min-h-[20rem] bg-white border-dashed border-[var(--mocha-beige)] rounded flex flex-col items-center justify-center cursor-pointer mb-2 hover:border-[var(--arabica-brown)] border-2 transition-colors"
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
              <span className="text-6xl !text-[var(--arabica-brown)] mb-2">&#8682;</span>
              <span className="text-sm text-[var(--espresso-black)] font-accent">
                Drop your images here or click to browse (Max {maxImages} images) - {selectedFiles.length}/{maxImages} selected
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
                      className="w-full bg-white p-2 border border-gray-300 rounded text-sm resize-none h-16"
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
            <div className="w-full min-h-[20rem] bg-white border-dashed border-[var(--mocha-beige)] rounded flex flex-col items-center justify-center cursor-pointer mb-2 hover:border-[var(--arabica-brown)] border-2 transition-colors">
              <span className="text-4xl text-[var(--espresso-black)] mb-2">📷</span>
              <span className="text-xs text-[var(--espresso-black)] font-accent mb-3">
                Take up to {maxImages} photos with your camera
              </span>
              <button
                onClick={() => setShowCamera(true)}
                className="bg-[var(--espresso-black)] text-white px-4 py-2 rounded font-medium"
                disabled={capturedImages.length >= (maxImages ?? 5)}
              >
                {capturedImages.length >= (maxImages ?? 5) ? 'Max Photos Reached' : `Open Camera (${capturedImages.length}/${maxImages ?? 5})`}
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
                      className="w-full p-2 border bg-white border-gray-300 rounded text-sm resize-none h-16"
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
            maxPhotos={(maxImages ?? 5)}
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

        {/* Notification Modal */}
        <NotificationModal
          isOpen={notification.isOpen}
          onClose={hideNotification}
          mode={notification.mode}
          title={notification.title}
          message={notification.message}
          confirmText={notification.confirmText}
          cancelText={notification.cancelText}
          onConfirm={notification.onConfirm}
          onCancel={notification.onCancel}
          showCancel={notification.showCancel}
          autoClose={notification.autoClose}
          autoCloseDelay={notification.autoCloseDelay}
        />
      </div>
    );
  }


  return null;
};

export default UploadBodySection;