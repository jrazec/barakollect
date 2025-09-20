import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import type { FarmFolder, BeanImage, PaginationData } from '@/interfaces/global';
import { storageService } from '@/services/storageService';
import EnhancedImageDetailsModal from './EnhancedImageDetailsModal';

const ResearcherAnnotations: React.FC = () => {
    const navigate = useNavigate();
    const [folders, setFolders] = useState<FarmFolder[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<FarmFolder | null>(null);
    const [images, setImages] = useState<BeanImage[]>([]);
    const [validationFilter, setValidationFilter] = useState<'all' | 'validated' | 'not-validated'>('all');
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationData>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20
    });
    const [userId, setUserId] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<BeanImage | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);
        };
        getUser();
    }, []);

    useEffect(() => {
        if (userId) {
            loadFolders();
        }
    }, [userId]);

    useEffect(() => {
        if (selectedFolder && userId) {
            loadImages();
        }
    }, [selectedFolder, validationFilter, pagination.currentPage, userId]);

    const loadFolders = async () => {
        if (!userId) return;
        
        setIsLoading(true);
        try {
            const folderData = await storageService.getFarmFolders(userId);
            setFolders(folderData);
        } catch (error) {
            console.error('Error loading folders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadImages = async () => {
        if (!selectedFolder || !userId) return;
        
        setIsLoading(true);
        try {
            const validated = validationFilter === 'all' ? undefined : validationFilter === 'validated';
            const result = await storageService.getBeanImagesByFarm(
                selectedFolder.id,
                userId,
                validated,
                pagination.currentPage,
                pagination.itemsPerPage
            );
            setImages(result.images);
            setPagination(result.pagination);
        } catch (error) {
            console.error('Error loading images:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFolderClick = async (folder: FarmFolder) => {
        if (folder.isLocked && !folder.hasAccess) {
            // Redirect to notifications with farm owner ID
            navigate(`/researcher/notifications?farmOwnerId=${folder.ownerId}&farmId=${folder.id}&farmName=${encodeURIComponent(folder.name)}`);
            return;
        }
        
        setSelectedFolder(folder);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleBackToFolders = () => {
        setSelectedFolder(null);
        setImages([]);
    };

    const handleImageClick = (image: BeanImage) => {
        setSelectedImage(image);
        setIsModalOpen(true);
    };

    const handleBeanValidation = async (beanId: number, validated: boolean) => {
        if (!selectedImage) return;
        
        try {
            // TODO: Implement API call for bean validation
            // await storageService.validateBeanDetection(selectedImage.id, beanId, validated);
            console.log(`Validating bean ${beanId} as ${validated ? 'validated' : 'not validated'}`);
            // Refresh images after validation
            loadImages();
        } catch (error) {
            console.error('Error validating bean:', error);
            alert('Failed to validate bean. Please try again.');
        }
    };

    const handleImageDelete = async (imageId: string) => {
        try {
            // TODO: Implement API call for image deletion
            // await storageService.deleteImage(imageId);
            console.log(`Deleting image ${imageId}`);
            loadImages();
            setIsModalOpen(false);
            setSelectedImage(null);
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Failed to delete image. Please try again.');
        }
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const renderFolderView = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.map((folder) => (
                    <div
                        key={folder.id}
                        onClick={() => handleFolderClick(folder)}
                        className={`p-6 bg-white rounded-lg shadow-md border-2 transition-all duration-200 cursor-pointer ${
                            folder.isLocked && !folder.hasAccess
                                ? 'border-red-200 hover:border-red-300 bg-red-50'
                                : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
                        }`}
                    >
                        <div className="flex items-center space-x-3 mb-3">
                            {folder.isLocked && !folder.hasAccess ? (
                                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                </svg>
                            )}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{folder.name}</h3>
                                {folder.type !== 'own' && (
                                    <p className="text-sm text-gray-500">Owner: {folder.ownerName}</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Images:</span>
                                <span className="font-medium">{folder.imageCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Validated:</span>
                                <span className="font-medium text-green-600">{folder.validatedCount}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{
                                        width: `${folder.imageCount > 0 ? (folder.validatedCount / folder.imageCount) * 100 : 0}%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        {folder.isLocked && !folder.hasAccess && (
                            <div className="mt-3 p-2 bg-red-100 rounded text-sm text-red-700">
                                🔒 Locked - Click to request access
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderImagesView = () => (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleBackToFolders}
                        className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back to Folders</span>
                    </button>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{selectedFolder?.name}</h2>
                        <p className="text-sm text-gray-600">
                            {selectedFolder?.type !== 'own' && `Owner: ${selectedFolder?.ownerName} • `}
                            {images.length} images
                        </p>
                    </div>
                </div>

                {/* Validation Filter */}
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Filter:</label>
                    <select
                        value={validationFilter}
                        onChange={(e) => setValidationFilter(e.target.value as any)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Images</option>
                        <option value="validated">Validated</option>
                        <option value="not-validated">Not Yet Validated</option>
                    </select>
                </div>
            </div>

            {/* Images Gallery */}
            <div className="min-h-96">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-600">Loading images...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((image) => (
                            <div
                                key={image.id}
                                onClick={() => handleImageClick(image)}
                                className="group relative cursor-pointer bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200"
                            >
                                <img
                                    src={image.src}
                                    alt={`Bean sample ${image.id}`}
                                    className="w-full h-48 object-cover rounded-t-lg"
                                />
                                <div className="p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            image.is_validated 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {image.is_validated ? 'Validated' : 'Pending'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(image.submissionDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {image.predictions.length > 0 
                                            ? image.predictions.length === 1 
                                                ? image.predictions[0].bean_type 
                                                : `${image.predictions.length} beans detected`
                                            : 'No beans detected'
                                        }
                                    </p>
                                    {image.allegedVariety && (
                                        <p className="text-xs text-gray-600 truncate">
                                            Variety: {image.allegedVariety}
                                        </p>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                        {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                        {pagination.totalItems} images
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 border rounded-md ${
                                    page === pagination.currentPage
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : 'border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="p-6 bg-white">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Bean Annotations</h1>
                <p className="text-gray-600">
                    {selectedFolder 
                        ? `Annotate and validate bean samples in ${selectedFolder.name}`
                        : 'Select a farm folder to start annotating bean samples'
                    }
                </p>
            </div>

            {/* Content */}
            {isLoading && !selectedFolder ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">Loading folders...</span>
                </div>
            ) : selectedFolder ? (
                renderImagesView()
            ) : (
                renderFolderView()
            )}

            {/* Enhanced Annotation Modal */}
            {selectedImage && (
                <EnhancedImageDetailsModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedImage(null);
                    }}
                    image={{
                        id: selectedImage.id,
                        src: selectedImage.src,
                        predictions: selectedImage.predictions,
                        submissionDate: selectedImage.submissionDate,
                        allegedVariety: selectedImage.allegedVariety,
                        userName: selectedImage.userName,
                        userRole: selectedImage.userRole
                    }}
                    userRole="researcher"
                    onValidateBean={handleBeanValidation}
                    onDeleteImage={handleImageDelete}
                />
            )}
        </div>
    );
};

export default ResearcherAnnotations;
