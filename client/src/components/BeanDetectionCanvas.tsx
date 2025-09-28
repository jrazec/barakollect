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
  features?: { [key: string]: any };
}

interface BeanDetectionCanvasProps {
  imageSrc: string;
  beans: BeanDetection[];
  selectedBeanId?: number;
  onBeanSelect?: (beanId: number) => void;
  highlightBestCandidate?: boolean;
  className?: string;
  showBeanBoxes?: boolean;
  zoomLevel?: number;
  showZoomControls?: boolean;
  onZoomChange?: (zoom: number) => void;
}

const BeanDetectionCanvas: React.FC<BeanDetectionCanvasProps> = ({
  imageSrc,
  beans,
  selectedBeanId,
  onBeanSelect,
  highlightBestCandidate = false,
  className = "",
  showBeanBoxes = true,
  zoomLevel = 1,
  showZoomControls = false,
  onZoomChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Find the best candidate (largest bean by length)
  const bestCandidateId = highlightBestCandidate && beans.length > 0 
    ? beans.reduce((prev, current) => 
        (prev.features?.area_mm2 > current?.features?.area_mm2) ? prev : current
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
  }, [beans, selectedBeanId, imageLoaded, bestCandidateId, showBeanBoxes, zoomLevel, panOffset]);

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
    const baseScale = Math.min(canvas.width / image.width, canvas.height / image.height);
    const scale = baseScale * zoomLevel;
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const offsetX = (canvas.width - scaledWidth) / 2 + panOffset.x;
    const offsetY = (canvas.height - scaledHeight) / 2 + panOffset.y;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

    // Draw bounding boxes and labels only if showBeanBoxes is true
    if (showBeanBoxes) {
      beans.forEach((bean) => {
        const [x, y, width, height] = bean.bbox;
        
        // Scale coordinates
        const scaledX = offsetX + (x * scale);
        const scaledY = offsetY + (y * scale);
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;

        // Determine box color based on validation status and selection
        let boxColor = '#3B82F6'; // Blue default
        let lineWidth = 2 * zoomLevel;
        
        if (bean.bean_id === bestCandidateId) {
          boxColor = '#10B981'; // Green for best candidate
          lineWidth = 3 * zoomLevel;
        } else if (bean.is_validated === true) {
          boxColor = '#059669'; // Green for validated
        } else if (bean.is_validated === false) {
          boxColor = '#F59E0B'; // Yellow for pending
        }

        if (bean.bean_id === selectedBeanId) {
          boxColor = '#DC2626'; // Red for selected
          lineWidth = 3 * zoomLevel;
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
        ctx.font = `${12 * Math.min(zoomLevel, 2)}px Inter, sans-serif`;
        const labelMetrics = ctx.measureText(labelText);
        const labelWidth = labelMetrics.width + 12 * zoomLevel;
        const labelHeight = 20 * zoomLevel;

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
        ctx.fillText(labelText, labelX + 6 * zoomLevel, labelY - labelHeight / 2);

        // Draw validation status indicator
        if (bean.is_validated !== null && bean.is_validated !== undefined) {
          const indicatorSize = 8 * zoomLevel;
          const indicatorX = scaledX + scaledWidth - indicatorSize - 2 * zoomLevel;
          const indicatorY = scaledY + 2 * zoomLevel;
          
          ctx.fillStyle = bean.is_validated ? '#10B981' : '#F59E0B';
          ctx.fillRect(indicatorX, indicatorY, indicatorSize, indicatorSize);
          
          // Add checkmark or question mark
          ctx.fillStyle = 'white';
          ctx.font = `${8 * Math.min(zoomLevel, 2)}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(
            bean.is_validated ? '✓' : '?', 
            indicatorX + indicatorSize / 2, 
            indicatorY + indicatorSize / 2 + 1
          );
        }
      });
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onBeanSelect || !imageRef.current || !imageLoaded || isPanning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate scale and offset
    const baseScale = Math.min(canvas.width / imageRef.current.width, canvas.height / imageRef.current.height);
    const scale = baseScale * zoomLevel;
    const scaledWidth = imageRef.current.width * scale;
    const scaledHeight = imageRef.current.height * scale;
    const offsetX = (canvas.width - scaledWidth) / 2 + panOffset.x;
    const offsetY = (canvas.height - scaledHeight) / 2 + panOffset.y;

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

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const deltaX = event.clientX - lastPanPoint.x;
      const deltaY = event.clientY - lastPanPoint.y;
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    if (onZoomChange) {
      onZoomChange(Math.min(zoomLevel * 1.2, 5));
    }
  };

  const handleZoomOut = () => {
    if (onZoomChange) {
      onZoomChange(Math.max(zoomLevel / 1.2, 0.5));
      if (zoomLevel <= 1) {
        setPanOffset({ x: 0, y: 0 });
      }
    }
  };

  const handleZoomReset = () => {
    if (onZoomChange) {
      onZoomChange(1);
      setPanOffset({ x: 0, y: 0 });
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
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`absolute inset-0 w-full h-full ${isPanning ? 'cursor-grabbing' : zoomLevel > 1 ? 'cursor-grab' : 'cursor-pointer'}`}
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
      
      {/* Zoom Controls */}
      {showZoomControls && (
        <div className="absolute top-2 left-2 bg-[rgba(0,0,0,0.35)] bg-opacity-75 text-white text-xs p-2 rounded flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={handleZoomReset}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
            title="Reset Zoom"
          >
            1:1
          </button>
          <div className="text-center text-xs mt-1">
            {Math.round(zoomLevel * 100)}%
          </div>
        </div>
      )}
      
      {/* Legend */}
      {/* {showBeanBoxes && (
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
      )} */}
    </div>
  );
};

export default BeanDetectionCanvas;
