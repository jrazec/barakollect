import React, { useState } from 'react';
import EmptyStateNotice from './EmptyStateNotice';
import ImageDetailsModal from './ImageDetailsModal';
import EnhancedImageDetailsModal from './EnhancedImageDetailsModal';

interface BeanDetection {
    bean_id: number;
    is_validated?: boolean | null;
    bean_type?: string;
    confidence?: number;
    length_mm: number;
    width_mm: number;
    bbox: [number, number, number, number];
    comment?: string;
    detection_date?: string;
}

type PredictedImage = {
    src: string;
    is_validated?: boolean;
    predictions: BeanDetection[] | {
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

type AdminImage = {
    id: string;
    src: string;
    bean_type?: string; // For single bean predictions (legacy)
    is_validated: boolean;
    location: string;
    allegedVariety?: string;
    userName?: string;
    userRole?: string;
    submissionDate?: string;
    predictions?: BeanDetection[] | {
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

type UserFolder = {
    userName: string;
    userRole?: string;
    imageCount: number;
    images: (string | PredictedImage | AdminImage)[];
};

type GalleryComponentProps = {
    images: (string | PredictedImage | AdminImage)[];
    type: 'simple' | 'predicted' | 'admin';
    isLoading?: boolean;
    onDeleteImage?: (id: string) => void;
    customViewMode?: 'grid' | 'list';
    showViewToggle?: boolean;
    maxHeight?: string;
    // New props for folder navigation
    enableFolderView?: boolean;
    onDownloadImages?: (images: (string | PredictedImage | AdminImage)[], folderName?: string) => void;
    onDownloadImageDetails?: (images: (string | PredictedImage | AdminImage)[], folderName?: string) => void;
};

const GalleryComponent: React.FC<GalleryComponentProps> = ({ 
    images, 
    type, 
    isLoading = false,
    onDeleteImage,
    customViewMode,
    showViewToggle = true,
    maxHeight = '55vh',
    enableFolderView = false,
    onDownloadImages,
    onDownloadImageDetails
}) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(customViewMode || 'grid');
    const [selectedImage, setSelectedImage] = useState<PredictedImage | AdminImage | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // New state for folder navigation
    const [currentPath, setCurrentPath] = useState<string[]>(['Beans']);
    const [isInFolderView, setIsInFolderView] = useState(enableFolderView);
    const [currentFolderImages, setCurrentFolderImages] = useState<(string | PredictedImage | AdminImage)[]>([]);
    const [currentFolderName, setCurrentFolderName] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [userFolders, setUserFolders] = useState<UserFolder[]>([]);

    // Update viewMode when customViewMode changes
    React.useEffect(() => {
        if (customViewMode) {
            setViewMode(customViewMode);
        }
    }, [customViewMode]);

    // Process images into user folders when enableFolderView is true
    React.useEffect(() => {
        if (enableFolderView && images.length > 0) {
            const folderMap = new Map<string, UserFolder>();
            
            images.forEach(image => {
                let userName = 'Unknown User';
                let userRole = 'user';
                
                if (typeof image === 'object' && 'userName' in image && image.userName) {
                    userName = image.userName;
                    userRole = image.userRole || 'user';
                }
                
                if (!folderMap.has(userName)) {
                    folderMap.set(userName, {
                        userName,
                        userRole,
                        imageCount: 0,
                        images: []
                    });
                }
                
                const folder = folderMap.get(userName)!;
                folder.images.push(image);
                folder.imageCount = folder.images.length;
            });
            
            setUserFolders(Array.from(folderMap.values()));
        }
    }, [images, enableFolderView]);

    // Navigation functions
    const navigateToFolder = (folderName: string, folderImages: (string | PredictedImage | AdminImage)[]) => {
        setCurrentPath(['Beans', folderName]);
        setCurrentFolderName(folderName);
        setCurrentFolderImages(folderImages);
        setIsInFolderView(false); // Switch to image view
    };

    const navigateToRoot = () => {
        setCurrentPath(['Beans']);
        setCurrentFolderName('');
        setCurrentFolderImages([]);
        setIsInFolderView(enableFolderView);
    };

    const navigateToBreadcrumb = (index: number) => {
        if (index === 0) {
            navigateToRoot();
        }
    };

    const handleImageClick = (image: any, index: number) => {
        console.log('Image clicked:', image, 'Type:', type); // Debug log
        if (type === 'simple') return;
        
        if (type === 'predicted' || type === 'admin') {
            // For simple string images, create a mock object for demo
            if (typeof image === 'string') {
                // TODO: Replace with Service call to fetch image details
                const mockImage = type === 'predicted' ? {
                    src: image,
                    is_validated: Math.random() > 0.5,
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
                    is_validated: Math.random() > 0.5,
                    location: 'Farm A, Section 2',
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
                    },
                    userName: 'Mock User',
                    userRole: 'farmer',
                    submissionDate: '2024-01-20'
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-800"></div>
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
        <div className="w-full border border-gray-300 bg-gray-50 flex flex-col overflow-y-auto" >
            {/* Breadcrumb Navigation */}
            {enableFolderView && (
                <div className="p-3 border-b border-gray-200 bg-white">
                    <div className="flex items-center space-x-2 text-sm">
                        {currentPath.map((pathItem, index) => (
                            <React.Fragment key={index}>
                                <button
                                    onClick={() => navigateToBreadcrumb(index)}
                                    className={`${
                                        index === currentPath.length - 1
                                            ? '!text-[var(--arabica-brown)] font-bold !bg-[var(--parchment)]'
                                            : '!text-[var(--coffee-gray)] !bg-[var(--parchment)] !hover:text-amber-900'
                                    }`}
                                >
                                    {pathItem}
                                </button>
                                {index < currentPath.length - 1 && (
                                    <svg className="w-4 h-4 text-gray-500 font-medium" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            {/* Search and Controls */}
            {enableFolderView && isInFolderView && (
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search Bar */}
                        <div className="flex-1">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search by user name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                />
                            </div>
                        </div>
                        
                        {/* Download All Buttons */}
                        <div className="flex space-x-2">
                            <button
                                onClick={() => onDownloadImages && onDownloadImages(images)}
                                className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                </svg>
                                <span>Download All Images</span>
                            </button>
                            <button
                                onClick={() => onDownloadImageDetails && onDownloadImageDetails(images)}
                                className="px-4 py-2 bg-yellow-700 text-white rounded-lg hover:bg-yellow-800 flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path>
                                </svg>
                                <span>Download All Details</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header with view toggle */}
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                        {isInFolderView 
                            ? `${userFolders.filter(folder => 
                                folder.userName.toLowerCase().includes(searchQuery.toLowerCase())
                            ).length} folders` 
                            : `${currentFolderImages.length || images.length} images`
                        }
                    </span>
                    
                    {/* Download buttons for specific folder */}
                    {!isInFolderView && currentFolderName && (
                        <div className="flex space-x-2">
                            <button
                                onClick={() => onDownloadImages && onDownloadImages(currentFolderImages, currentFolderName)}
                                className="px-3 py-1 bg-amber-700 text-white text-xs rounded hover:bg-amber-800 flex items-center space-x-1"
                            >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                </svg>
                                <span>Images</span>
                            </button>
                            <button
                                onClick={() => onDownloadImageDetails && onDownloadImageDetails(currentFolderImages, currentFolderName)}
                                className="px-3 py-1 bg-yellow-700 text-white text-xs rounded hover:bg-yellow-800 flex items-center space-x-1"
                            >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path>
                                </svg>
                                <span>Details</span>
                            </button>
                        </div>
                    )}
                </div>
                {showViewToggle && (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-amber-100 text-amber-800' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-amber-100 text-amber-800' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path>
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-3" style={{ maxHeight }}>
                {enableFolderView && isInFolderView ? (
                    // Folder View - Show user folders
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max">
                                {userFolders
                                    .filter(folder => 
                                        folder.userName.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((folder, idx) => (
                                    <div
                                        key={idx}
                                        className="group relative cursor-pointer"
                                        onClick={() => navigateToFolder(folder.userName, folder.images)}
                                    >
                                        <div className="w-full p-4 bg-[var(--parchment)] rounded-lg shadow hover:shadow-lg transition-shadow border-1 border-gray-300">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-[var(--parchment)] rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-6 h-6 text-[var(--mocha)]" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-amber-900 truncate">{folder.userName}</p>
                                                    <p className="text-xs text-[var(--mocha)]">
                                                        {folder.imageCount} images • {folder.userRole}
                                                    </p>
                                                </div>
                                                <svg className="w-5 h-5 text-[var(--mocha)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {userFolders
                                    .filter(folder => 
                                        folder.userName.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((folder, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer border border-gray-200"
                                        onClick={() => navigateToFolder(folder.userName, folder.images)}
                                    >
                                        <div className="w-12 h-12 bg-[var(--parchment)] rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-[var(--mocha)]" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{folder.userName}</p>
                                            <p className="text-xs text-gray-500">
                                                {folder.imageCount} images • {folder.userRole}
                                            </p>
                                        </div>
                                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                        </svg>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    // Image View - Show images (either from folder or direct images)
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max">
                                {(currentFolderImages.length > 0 ? currentFolderImages : images).map((image, idx) => {
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
                                                className="w-full aspect-square object-cover rounded-lg shadow hover:shadow-lg transition-shadow"
                                                onError={(e) => {
                                                    console.log('Image failed to load:', src);
                                                    (e.target as HTMLImageElement).style.backgroundColor = '#f3f4f6';
                                                    (e.target as HTMLImageElement).alt = 'Failed to load image';
                                                }}
                                            />
                                            {isClickable && (
                                                <div className="absolute inset-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {(currentFolderImages.length > 0 ? currentFolderImages : images).map((image, idx) => {
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
                                                    {type === 'admin' && typeof image === 'object' && ('bean_type' in image || 'predictions' in image) ? 
                                                        (() => {
                                                            const adminImg = image as AdminImage;
                                                            // Handle multi-bean predictions
                                                            if (adminImg.predictions && Array.isArray(adminImg.predictions)) {
                                                                return `${adminImg.predictions.length} beans detected • ${adminImg.is_validated ? 'Validated' : 'Pending'}`;
                                                            }
                                                            // Handle single bean prediction object
                                                            else if (adminImg.predictions && !Array.isArray(adminImg.predictions)) {
                                                                return `${adminImg.predictions.bean_type} • ${adminImg.is_validated ? 'Validated' : 'Pending'}`;
                                                            }
                                                            // Handle legacy bean_type field
                                                            else if (adminImg.bean_type) {
                                                                return `${adminImg.bean_type} • ${adminImg.is_validated ? 'Validated' : 'Pending'}`;
                                                            }
                                                            // Fallback
                                                            else {
                                                                return `${adminImg.is_validated ? 'Validated' : 'Pending'}`;
                                                            }
                                                        })() : 
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
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal */}
            {selectedImage && (
                <>
                    {/* Check if we have multi-bean detection data (array of BeanDetection) or if it's admin with multi-bean predictions */}
                    {(Array.isArray(selectedImage.predictions) || 
                      (type === 'admin' && selectedImage.predictions && Array.isArray((selectedImage as AdminImage).predictions))) ? (
                        <EnhancedImageDetailsModal
                            isOpen={isModalOpen}
                            onClose={() => {
                                setIsModalOpen(false);
                                setSelectedImage(null);
                            }}
                            image={selectedImage as any}
                            userRole={type === 'admin' ? 'admin' : 'farmer'}
                            onDeleteImage={type === 'admin' ? handleDelete : undefined}
                        />
                    ) : (
                        <ImageDetailsModal
                            isOpen={isModalOpen}
                            onClose={() => {
                                setIsModalOpen(false);
                                setSelectedImage(null);
                            }}
                            image={selectedImage as any}
                            type={type as 'predicted' | 'admin'}
                            onDelete={type === 'admin' ? handleDelete : undefined}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default GalleryComponent;