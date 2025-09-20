import React, { useRef, useEffect, useState } from 'react';

interface BeanDetection {
  bean_id: number;
  is_validated?: boolean | null;
  bean_type?: string;
  confidence?: number;
  length_mm: number;
  width_mm: number;
  bbox: [number, number, number, number];
  comment?: string;
}

interface BeanDetectionCanvasProps {
  imageSrc: string;
  beans: BeanDetection[];
  selectedBeanId?: number;
  onBeanSelect?: (beanId: number) => void;
  highlightBestCandidate?: boolean;
  className?: string;
}

const BeanDetectionCanvas: React.FC<BeanDetectionCanvasProps> = ({
  imageSrc,
  beans,
  selectedBeanId,
  onBeanSelect,
  highlightBestCandidate = false,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Find the best candidate (largest bean by length)
  const bestCandidateId = highlightBestCandidate && beans.length > 0 
    ? beans.reduce((prev, current) => 
        (prev.length_mm > current.length_mm) ? prev : current
      ).bean_id 
    : null;

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setImageLoaded(true);
      imageRef.current = image;
    };
    image.src = imageSrc;
    imageRef.current = image;
  }, [imageSrc]);

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [beans, selectedBeanId, imageLoaded, bestCandidateId]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const container = canvas.parentElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // Calculate scale to fit image in canvas while maintaining aspect ratio
    const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

    // Draw bounding boxes and labels
    beans.forEach((bean) => {
      const [x, y, width, height] = bean.bbox;
      
      // Scale coordinates
      const scaledX = offsetX + (x * scale);
      const scaledY = offsetY + (y * scale);
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;

      // Determine box color based on validation status and selection
      let boxColor = '#3B82F6'; // Blue default
      let lineWidth = 2;
      
      if (bean.bean_id === bestCandidateId) {
        boxColor = '#10B981'; // Green for best candidate
        lineWidth = 3;
      } else if (bean.is_validated === true) {
        boxColor = '#059669'; // Green for validated
      } else if (bean.is_validated === false) {
        boxColor = '#F59E0B'; // Yellow for pending
      }

      if (bean.bean_id === selectedBeanId) {
        boxColor = '#DC2626'; // Red for selected
        lineWidth = 3;
      }

      // Draw bounding box
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

      // Prepare label text
      const labelParts = [];
      labelParts.push(`#${bean.bean_id}`);
      
      if (bean.bean_type) {
        labelParts.push(bean.bean_type);
      }
      
      if (bean.confidence !== null && bean.confidence !== undefined) {
        labelParts.push(`${(bean.confidence * 100).toFixed(0)}%`);
      }

      if (bean.bean_id === bestCandidateId) {
        labelParts.push('BEST');
      }

      const labelText = labelParts.join(' • ');

      // Calculate label dimensions
      ctx.font = '12px Inter, sans-serif';
      const labelMetrics = ctx.measureText(labelText);
      const labelWidth = labelMetrics.width + 12;
      const labelHeight = 20;

      // Position label above or below the box depending on space
      const labelX = scaledX;
      const labelY = scaledY - labelHeight < 0 ? scaledY + scaledHeight + labelHeight : scaledY;

      // Draw label background
      ctx.fillStyle = boxColor;
      ctx.fillRect(labelX, labelY - labelHeight, labelWidth, labelHeight);

      // Draw label text
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, labelX + 6, labelY - labelHeight / 2);

      // Draw validation status indicator
      if (bean.is_validated !== null && bean.is_validated !== undefined) {
        const indicatorSize = 8;
        const indicatorX = scaledX + scaledWidth - indicatorSize - 2;
        const indicatorY = scaledY + 2;
        
        ctx.fillStyle = bean.is_validated ? '#10B981' : '#F59E0B';
        ctx.fillRect(indicatorX, indicatorY, indicatorSize, indicatorSize);
        
        // Add checkmark or question mark
        ctx.fillStyle = 'white';
        ctx.font = '8px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          bean.is_validated ? '✓' : '?', 
          indicatorX + indicatorSize / 2, 
          indicatorY + indicatorSize / 2 + 1
        );
      }
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onBeanSelect || !imageRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate scale and offset
    const scale = Math.min(canvas.width / imageRef.current.width, canvas.height / imageRef.current.height);
    const scaledWidth = imageRef.current.width * scale;
    const scaledHeight = imageRef.current.height * scale;
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    // Check which bean was clicked
    for (const bean of beans) {
      const [bx, by, bwidth, bheight] = bean.bbox;
      
      const scaledX = offsetX + (bx * scale);
      const scaledY = offsetY + (by * scale);
      const scaledBWidth = bwidth * scale;
      const scaledBHeight = bheight * scale;

      if (x >= scaledX && x <= scaledX + scaledBWidth &&
          y >= scaledY && y <= scaledY + scaledBHeight) {
        onBeanSelect(bean.bean_id);
        return;
      }
    }
  };

  const handleResize = () => {
    if (imageLoaded) {
      // Debounce resize
      setTimeout(() => {
        drawCanvas();
      }, 100);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageLoaded]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 w-full h-full cursor-pointer"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
      
      {/* Legend */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-green-500"></div>
            <span>Validated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-yellow-500"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-blue-500"></div>
            <span>Default</span>
          </div>
          {highlightBestCandidate && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-green-600 bg-green-600"></div>
              <span>Best Candidate</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BeanDetectionCanvas;
