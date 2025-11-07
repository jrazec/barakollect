import React, { useState, useEffect } from 'react';
import { type AnnotationImage } from '@/services/annotationService';
import { useCachedAnnotationService } from '@/hooks/useCachedServices';
import type { PaginationData } from '@/interfaces/global';
import EnhancedImageEditModal from '@/components/EnhancedImageEditModal';
import useNotification from '@/hooks/useNotification';
import NotificationModal from '@/components/ui/NotificationModal';

import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';

interface FolderData {
    userName: string;
    userRole?: string;
    location: string;
    images: AnnotationImage[];
    totalBeans: number;
    validatedBeans: number;
    totalImages: number;
    validatedImages: number;
}

const Annotations: React.FC = () => {
    const { user, role } = useAuth();
    const [images, setImages] = useState<AnnotationImage[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 100
    });
    const [isLoading, setIsLoading] = useState(true);

    // Initialize notification system
    const { notification, showSuccess, showError, hideNotification } = useNotification();

    
    // Modal state
    const [selectedImage, setSelectedImage] = useState<AnnotationImage | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // Folder filtering state
    const [folderFilter, setFolderFilter] = useState<'all' | 'validated' | 'pending'>('all');

    // Initialize cached services
    const cachedAnnotationService = useCachedAnnotationService();

    // Load annotations data
    useEffect(() => {
        loadAnnotations();
    }, [pagination.currentPage]);

    const loadAnnotations = async () => {
        setIsLoading(true);
        try {
            const result = await cachedAnnotationService.getAnnotations(
                pagination.currentPage,
                pagination.itemsPerPage
            );
            setImages(result.images);
            setPagination(result.pagination);
        } catch (error) {
            console.error('Error loading annotations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    // Handle image click to open edit modal
    const handleImageClick = (image: AnnotationImage) => {
        console.log('Opening edit modal for image:', image);
        setSelectedImage(image);
        setIsEditModalOpen(true);
    };

    // Handle bean validation
    const handleValidateBean = async (beanId: number, updatedBean: any) => {
        if (!selectedImage || !user) return;

        try {
            // Get current user info for annotated_by
            const annotatedBy = {
                id: user.id,
                name: user.name,
                role: role
            };

            await cachedAnnotationService.validateBean({
                bean_id: beanId,
                bean_type: updatedBean.bean_type,
                features: updatedBean.features,
                extracted_feature_id: updatedBean.extracted_feature_id,
                prediction_id: updatedBean.prediction_id,
                is_validated: true,
                image_id: selectedImage.id,
                annotated_by: annotatedBy
            });

            // Update local state
            setImages(prevImages => 
                prevImages.map(img => {
                    if (img.id === selectedImage.id) {
                        const updatedPredictions = Array.isArray(img.predictions) 
                            ? img.predictions.map(pred => 
                                pred.bean_id === beanId 
                                    ? { ...pred, ...updatedBean, is_validated: true }
                                    : pred
                            )
                            : [];
                        
                        const validatedBeans = updatedPredictions.filter(p => p.is_validated === true).length;
                        const totalBeans = updatedPredictions.length;
                        
                        return {
                            ...img,
                            predictions: updatedPredictions,
                            validatedBeans,
                            validationProgress: totalBeans > 0 ? (validatedBeans / totalBeans * 100) : 0,
                            is_fully_validated: totalBeans > 0 && validatedBeans === totalBeans
                        };
                    }
                    return img;
                })
            );

            // Update selected image for modal
            setSelectedImage(prev => {
                if (!prev) return null;
                const updatedPredictions = Array.isArray(prev.predictions)
                    ? prev.predictions.map(pred => 
                        pred.bean_id === beanId 
                            ? { ...pred, ...updatedBean, is_validated: true }
                            : pred
                    )
                    : [];
                
                return {
                    ...prev,
                    predictions: updatedPredictions
                };
            });
            showSuccess('Bean Validated', 'The bean has been validated successfully.');
            console.log('Bean validated successfully');
        } catch (error) {
            console.error('Error validating bean:', error);
            showError('Validation Failed', 'Failed to validate bean. Please try again.');
        }
    };

    // Create custom gallery component with folder support and validation highlighting
    const CustomGalleryWithHighlighting: React.FC<{
        images: AnnotationImage[];
        onImageClick: (image: AnnotationImage) => void;
    }> = ({ images, onImageClick }) => {
        // Group images by location/user for folder view
        const folders = images.reduce((acc, image) => {
            const folderKey = `${image.userName} (${image.location || 'Unknown Location'})`;
            if (!acc[folderKey]) {
                acc[folderKey] = {
                    userName: image.userName || 'Unknown',
                    userRole: image.userRole,
                    location: image.location || 'Unknown Location',
                    images: [],
                    totalBeans: 0,
                    validatedBeans: 0,
                    totalImages: 0,
                    validatedImages: 0
                };
            }
            
            acc[folderKey].images.push(image);
            acc[folderKey].totalBeans += image.totalBeans || 0;
            acc[folderKey].validatedBeans += image.validatedBeans || 0;
            acc[folderKey].totalImages += 1;
            if (image.is_fully_validated) {
                acc[folderKey].validatedImages += 1;
            }
            
            return acc;
        }, {} as Record<string, FolderData>);

        // Apply folder filtering
        const filteredImages = folderFilter === 'all' ? images : 
            images.filter(img => {
                if (folderFilter === 'validated') return img.is_fully_validated;
                if (folderFilter === 'pending') return !img.is_fully_validated;
                return true;
            });

        return (
            <div className="p-4">
                {/* Folder Filter Controls */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium text-gray-700">Filter:</label>
                        <div className="flex space-x-2">
                            {(['all', 'validated', 'pending'] as const).map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setFolderFilter(filter)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        folderFilter === filter
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {filter.charAt(0).toUpperCase() + filter.slice(1)} 
                                    {filter === 'validated' && ` (${images.filter(i => i.is_fully_validated).length})`}
                                    {filter === 'pending' && ` (${images.filter(i => !i.is_fully_validated).length})`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Folder Overview */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(folders).map(([folderName, folder]) => {
                        const folderValidationProgress = folder.totalBeans > 0 
                            ? (folder.validatedBeans / folder.totalBeans * 100) 
                            : 0;
                        
                        return (
                            <div 
                                key={folderName}
                                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => {
                                    // For now, we'll show all images. Later this can open a filtered view
                                    console.log('Folder clicked:', folderName);
                                }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-900 truncate">{folderName}</h3>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        folder.userRole === 'farmer' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {folder.userRole}
                                    </span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-gray-600">Validation Progress</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {folderValidationProgress.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-gradient-to-r from-orange-400 to-amber-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${folderValidationProgress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-gray-600">Images</div>
                                        <div className="font-medium">
                                            {folder.validatedImages}/{folder.totalImages}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Beans</div>
                                        <div className="font-medium">
                                            {folder.validatedBeans}/{folder.totalBeans}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Images Grid with Highlighting */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">
                        Images ({filteredImages.length})
                        {folderFilter !== 'all' && (
                            <span className="ml-2 text-sm font-normal text-gray-600">
                                - Filtered: {folderFilter}
                            </span>
                        )}
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredImages.map((image) => (
                            <div
                                key={image.id}
                                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                                    image.is_fully_validated 
                                        ? 'border-amber-600 shadow-amber-200 shadow-md' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                onClick={() => onImageClick(image)}
                            >
                                {/* Validation Status Badge */}
                                <div className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-medium ${
                                    image.is_fully_validated 
                                        ? 'bg-amber-600 text-white' 
                                        : 'bg-gray-500 text-white'
                                }`}>
                                    {image.is_fully_validated ? '✓ Validated' : 'Pending'}
                                </div>

                                {/* Image */}
                                <div className="aspect-square relative overflow-hidden">
                                    <img
                                        src={image.src}
                                        alt={`Bean sample from ${image.userName}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    
                                    {/* Overlay with progress */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute bottom-2 left-2 right-2 text-white">
                                            <div className="text-xs mb-1">
                                                {image.validatedBeans}/{image.totalBeans} validated
                                            </div>
                                            <div className="w-full bg-white/20 rounded-full h-1">
                                                <div 
                                                    className="bg-amber-400 h-1 rounded-full"
                                                    style={{ width: `${image.validationProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Image Info */}
                                <div className="p-3 bg-white">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                        {image.userName}
                                    </div>
                                    <div className="text-xs text-gray-600 truncate">
                                        {image.location} • {image.submissionDate}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredImages.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No images found for the selected filter.
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full max-w-7xl bg-white p-6 mx-auto">
            {/* Header */}

            <PageHeader
                title="Bean Annotations"
                subtitle="Review and validate bean detections across all submitted samples"
            />

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">Loading annotations...</span>
                </div>
            ) : (
                <CustomGalleryWithHighlighting 
                    images={images} 
                    onImageClick={handleImageClick}
                />
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                        {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                        {pagination.totalItems} results
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const page = pagination.currentPage - 2 + i;
                            if (page < 1 || page > pagination.totalPages) return null;
                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-4 py-2 border rounded-md ${
                                        page === pagination.currentPage
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Enhanced Edit Modal */}
            {selectedImage && (
                <EnhancedImageEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    image={{
                        id: selectedImage.id,
                        src: selectedImage.src,
                        predictions: selectedImage.predictions,
                        userName: selectedImage.userName,
                        userRole: selectedImage.userRole,
                        location: selectedImage.location,
                        submissionDate: selectedImage.submissionDate,
                        allegedVariety: selectedImage.allegedVariety || undefined,
                    }}
                    userRole={role as 'farmer' | 'researcher' | 'admin'}
                    onValidateBean={handleValidateBean}
                />
            )}

            {/* Custom CSS for validation highlighting */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    .validated-image {
                        border-color: #d97706 !important;
                        box-shadow: 0 4px 6px -1px rgba(217, 119, 6, 0.3) !important;
                    }
                    
                    .pending-image {
                        border-color: #6b7280 !important;
                    }
                    
                    .validated-image:hover {
                        border-color: #92400e !important;
                        box-shadow: 0 6px 8px -1px rgba(217, 119, 6, 0.4) !important;
                    }
                `
            }} />
        </div>
    );
};

export default Annotations;