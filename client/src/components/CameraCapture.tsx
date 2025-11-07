import React, { useState, useRef, useCallback, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  maxPhotos: number;
  currentCount: number;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ 
  onCapture, 
  maxPhotos, 
  currentCount, 
  onClose 
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getAvailableDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      // Prefer back camera on mobile, any camera on desktop
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      
      setSelectedDeviceId(backCamera?.deviceId || videoDevices[0]?.deviceId || '');
    } catch (err) {
      console.error('Error enumerating devices:', err);
    }
  }, []);

  const startCamera = useCallback(async (deviceId?: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: deviceId ? undefined : { ideal: 'environment' },
          deviceId: deviceId ? { exact: deviceId } : undefined
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          setIsLoading(false);
        };
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      let errorMessage = 'Camera access failed. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported on this browser.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is being used by another application.';
      } else {
        errorMessage += 'Please check your camera and try again.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || currentCount >= maxPhotos) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw the video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob and create file
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { 
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          onCapture(file);
        }
      }, 'image/jpeg', 0.9);
    }
  }, [currentCount, maxPhotos, onCapture]);

  const handleClose = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  }, [stream, onClose]);

  useEffect(() => {
    // Check if camera API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera not supported on this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
      setIsLoading(false);
      return;
    }

    getAvailableDevices().then(() => {
      startCamera(selectedDeviceId);
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (selectedDeviceId && devices.length > 0) {
      startCamera(selectedDeviceId);
    }
  }, [selectedDeviceId]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/65  flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-red-600">Camera Error</h3>
            <button
              onClick={handleClose}
              className="button-accent"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="text-sm text-gray-600 mb-4">
            <p><strong>Troubleshooting tips:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Make sure you're using HTTPS (not HTTP)</li>
              <li>Check camera permissions in your browser settings</li>
              <li>Close other apps that might be using the camera</li>
              <li>Try refreshing the page</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => startCamera(selectedDeviceId)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Use File Upload
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/65 bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-2xl max-h-[90vh] w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[var(--espresso-black)]">
            Camera ({currentCount}/{maxPhotos})
          </h3>
          <button
            onClick={handleClose}
            className="button-accent"
          >
            ✕
          </button>
        </div>

        {devices.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Camera:
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="relative mb-4">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-600">Starting camera...</p>
              </div>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-[60vh] object-cover rounded bg-black"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={capturePhoto}
            disabled={isLoading || currentCount >= maxPhotos}
            className="bg-[var(--espresso-black)] text-white px-6 py-2 rounded font-medium disabled:opacity-50 flex items-center gap-2"
          >
            📷 Capture Photo
          </button>
          <button
            onClick={handleClose}
            className="bg-gray-500 text-white px-4 py-2 rounded font-medium"
          >
            Done
          </button>
        </div>

        <div className="mt-3 text-center text-xs text-gray-600">
          Make sure your browser has camera permissions enabled
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
