import React, { useState, useEffect, useRef } from 'react';

interface BeanDetection {
  bean_id: number;
  is_validated?: boolean | null;
  bean_type?: string;
  confidence?: number;
  length_mm: number;
  width_mm: number;
  bbox: [number, number, number, number];
  comment?: string;
  features?: { [key: string]: any };
}

interface BeanImageExtractorProps {
  bean: BeanDetection;
  imageSrc: string;
  size?: number;
}

const BeanImageExtractor: React.FC<BeanImageExtractorProps> = ({
  bean,
  imageSrc,
  size = 120
}) => {
  const [extractedImageSrc, setExtractedImageSrc] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const extractBeanImage = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const [x, y, width, height] = bean.bbox;
        const padding = Math.max(10, Math.min(width, height) * 0.1); // Dynamic padding based on bean size
        
        canvas.width = size;
        canvas.height = size;
        
        // Calculate the crop area with padding
        const cropX = Math.max(0, x - padding);
        const cropY = Math.max(0, y - padding);
        const cropWidth = Math.min(img.width - cropX, width + (padding * 2));
        const cropHeight = Math.min(img.height - cropY, height + (padding * 2));
        
        // Calculate scaling to fit the canvas while maintaining aspect ratio
        const scale = Math.min(size / cropWidth, size / cropHeight);
        const scaledWidth = cropWidth * scale;
        const scaledHeight = cropHeight * scale;
        
        // Center the scaled image on the canvas
        const offsetX = (size - scaledWidth) / 2;
        const offsetY = (size - scaledHeight) / 2;
        
        // Fill background
        ctx.fillStyle = '#f9f9f9';
        ctx.fillRect(0, 0, size, size);
        
        // Draw the cropped and scaled bean image
        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          offsetX, offsetY, scaledWidth, scaledHeight
        );
        
        // Add a subtle border to highlight the bean area
        const beanX = Math.max(0, (x - cropX) * scale + offsetX);
        const beanY = Math.max(0, (y - cropY) * scale + offsetY);
        const beanWidth = width * scale;
        const beanHeight = height * scale;
        
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.strokeRect(beanX, beanY, beanWidth, beanHeight);
        
        setExtractedImageSrc(canvas.toDataURL());
      };
      img.onerror = () => {
        console.error('Failed to load image for bean extraction');
      };
      img.src = imageSrc;
    };

    extractBeanImage();
  }, [bean, imageSrc, size]);

  return (
    <div className="flex flex-col items-center">
      <canvas 
        ref={canvasRef} 
        className="hidden"
      />
      {extractedImageSrc ? (
        <img
          src={extractedImageSrc}
          alt={`Bean #${bean.bean_id}`}
          className="rounded-lg border shadow-sm"
          style={{ width: size, height: size }}
        />
      ) : (
        <div 
          className="bg-gray-200 rounded-lg flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default BeanImageExtractor;