import React, { useState } from 'react';
import EmptyStateNotice from './EmptyStateNotice';
import ImageDetailsModal from './ImageDetailsModal';



type PredictedImage = {
    src: string;
    predictions: {
        area: number;
        perimeter: number;
        major_axis_length: number;
        minor_axis_length: number;
        extent: number;
        eccentricity: number;
        convex_area: number;
        solidity: number;
        mean_intensity: number;
        equivalent_diameter: number;
        bean_type: string;
    };
};

type SubmittedImage = {
    id: string;
    src: string;
    bean_type: string;
    is_validated: boolean;
    location: string;
    allegedVariety?: string;
    userName?: string;
    userRole?: string;
    submissionDate?: string;
    predictions?: {
        area: number;
        perimeter: number;
        major_axis_length: number;
        minor_axis_length: number;
        extent: number;
        eccentricity: number;
        convex_area: number;
        solidity: number;
        mean_intensity: number;
        equivalent_diameter: number;
        bean_type: string;
    };
};

type GalleryComponentProps = {
    images: (string | PredictedImage | SubmittedImage)[];
    type: 'simple' | 'predicted' | 'submitted' | 'admin';
    isLoading?: boolean;
    onDeleteImage?: (id: string) => void;
    customViewMode?: 'grid' | 'list';
    showViewToggle?: boolean;
    maxHeight?: string;
};

const GalleryComponent: React.FC<GalleryComponentProps> = ({ 
    images, 
    type, 
    isLoading = false,
    onDeleteImage,
    customViewMode,
    showViewToggle = true,
    maxHeight = '400px'
}) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(customViewMode || 'grid');
    const [selectedImage, setSelectedImage] = useState<PredictedImage | SubmittedImage | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Update viewMode when customViewMode changes
    React.useEffect(() => {
        if (customViewMode) {
            setViewMode(customViewMode);
        }
    }, [customViewMode]);

    const handleImageClick = (image: any, index: number) => {
        console.log('Image clicked:', image, 'Type:', type); // Debug log
        if (type === 'simple') return;
        
        if (type === 'predicted' || type === 'submitted' || type === 'admin') {
            // For simple string images, create a mock object for demo
            if (typeof image === 'string') {
                // TODO: Replace with Service call to fetch image details
                const mockImage = type === 'predicted' ? {
                    src: image,
                    predictions: {
                        area: 1500.5,
                        perimeter: 120.3,
                        major_axis_length: 45.2,
                        minor_axis_length: 32.1,
                        extent: 0.75,
                        eccentricity: 0.68,
                        convex_area: 1520.2,
                        solidity: 0.95,
                        mean_intensity: 128.5,
                        equivalent_diameter: 43.7,
                        bean_type: 'Arabica'
                    }
                } : {
                    id: `img_${index}`,
                    src: image,
                    bean_type: 'Robusta',
                    is_validated: Math.random() > 0.5,
                    location: 'Farm A, Section 2'
                };
                setSelectedImage(mockImage);
            } else {
                setSelectedImage(image);
            }
            setIsModalOpen(true);
        }
    };

    const handleDelete = async (id: string) => {
        if (onDeleteImage) {
            // Temporary API call - replace with actual endpoint
            try {
                // await api.delete(`/images/${id}`);
                onDeleteImage(id);
            } catch (error) {
                console.error('Failed to delete image:', error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className={`w-full border border-gray-300 p-3 box-border bg-gray-50 overflow-y-auto`} style={{ maxHeight }}>
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">Loading images...</span>
                </div>
            </div>
        );
    }

    if (!images || images.length === 0) {
        return (
            <div className={`w-full border border-gray-300 p-3 box-border bg-gray-50 overflow-y-auto`} style={{ maxHeight }}>
                <EmptyStateNotice message="No images found." />
            </div>
        );
    }

    return (
        <div className="w-full border border-gray-300 bg-gray-50">
            {/* Header with view toggle */}
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">{images.length} images</span>
                {showViewToggle && (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path>
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-3" style={{ maxHeight: `calc(${maxHeight} - 60px)` }}>
                {viewMode === 'grid' ? (
                    <div className={`grid gap-3 ${customViewMode ? 'grid-cols-2' : 'grid-cols-2'}`}>
                        {images.slice(0, customViewMode ? 4 : images.length).map((image, idx) => {
                            const src = typeof image === 'string' ? image : image.src;
                            const isClickable = type !== 'simple';
                            
                            return (
                                <div
                                    key={idx}
                                    className={`group relative ${isClickable ? 'cursor-pointer' : ''}`}
                                    onClick={() => isClickable && handleImageClick(image, idx)}
                                >
                                    <img
                                        src={src}
                                        alt={`Gallery item ${idx + 1}`}
                                        className={`w-full object-cover rounded-lg shadow hover:shadow-lg transition-shadow ${customViewMode ? 'h-[120px]' : 'h-[180px]'}`}
                                        onError={(e) => {
                                            console.log('Image failed to load:', src);
                                            (e.target as HTMLImageElement).style.backgroundColor = '#f3f4f6';
                                            (e.target as HTMLImageElement).alt = 'Failed to load image';
                                        }}
                                    />
                                    {isClickable && (
                                        <div className="absolute inset-0  group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {customViewMode && images.length > 4 && (
                            <div className="col-span-2 text-center py-2 text-sm text-gray-500">
                                +{images.length - 4} more images (click folder to view all)
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {images.slice(0, customViewMode ? 5 : images.length).map((image, idx) => {
                            const src = typeof image === 'string' ? image : image.src;
                            const isClickable = type !== 'simple';
                            const name = `Image ${idx + 1}`;
                            
                            return (
                                <div
                                    key={idx}
                                    className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 ${isClickable ? 'cursor-pointer' : ''}`}
                                    onClick={() => isClickable && handleImageClick(image, idx)}
                                >
                                    <img
                                        src={src}
                                        alt={name}
                                        className="w-12 h-12 object-cover rounded"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.backgroundColor = '#f3f4f6';
                                        }}
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{name}</p>
                                        <p className="text-xs text-gray-500">
                                            {type === 'submitted' && typeof image === 'object' && 'bean_type' in image ? 
                                                `${image.bean_type} • ${image.is_validated ? 'Validated' : 'Pending'}` : 
                                                type === 'predicted' ? 'Prediction available' : 'Image file'}
                                        </p>
                                    </div>
                                    {isClickable && (
                                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                        </svg>
                                    )}
                                </div>
                            );
                        })}
                        {customViewMode && images.length > 5 && (
                            <div className="text-center py-2 text-sm text-gray-500">
                                +{images.length - 5} more images (click folder to view all)
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedImage && (
                <ImageDetailsModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedImage(null);
                    }}
                    image={selectedImage}
                    type={type as 'predicted' | 'submitted' | 'admin'}
                    onDelete={type === 'submitted' ? handleDelete : undefined}
                />
            )}
        </div>
    );
};

export default GalleryComponent;