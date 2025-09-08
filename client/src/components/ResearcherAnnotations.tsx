import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminService } from '@/services/adminService';
import { supabase } from '@/lib/supabaseClient';
import type { FarmFolder, BeanImage, PaginationData } from '@/interfaces/global';
import { storageService } from '@/services/storageService';

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

    const handleAnnotation = async (imageId: string, annotations: {
        allegedVariety?: string;
        validated: boolean;
        notes?: string;
    }) => {
        try {
            await storageService.annotateBeanImage(imageId, annotations);
            // Refresh images after annotation
            loadImages();
            setIsModalOpen(false);
            setSelectedImage(null);
        } catch (error) {
            console.error('Error saving annotation:', error);
            alert('Failed to save annotation. Please try again.');
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
                                        {image.predictions.bean_type}
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

            {/* Annotation Modal */}
            {selectedImage && (
                <AnnotationModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedImage(null);
                    }}
                    image={selectedImage}
                    onSave={handleAnnotation}
                />
            )}
        </div>
    );
};

// Annotation Modal Component
interface AnnotationModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: BeanImage;
    onSave: (imageId: string, annotations: {
        allegedVariety?: string;
        validated: boolean;
        notes?: string;
    }) => void;
}

const AnnotationModal: React.FC<AnnotationModalProps> = ({ isOpen, onClose, image, onSave }) => {
    const [allegedVariety, setAllegedVariety] = useState(image.allegedVariety || '');
    const [validated, setValidated] = useState(image.is_validated);
    const [notes, setNotes] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);

    if (!isOpen) return null;

    const handleSave = () => {
        if (allegedVariety && !showConfirmation) {
            setShowConfirmation(true);
            return;
        }

        onSave(image.id, {
            allegedVariety: allegedVariety || undefined,
            validated,
            notes: notes || undefined
        });
        setShowConfirmation(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Annotate Bean Sample</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Image */}
                        <div>
                            <img
                                src={image.src}
                                alt="Bean sample"
                                className="w-full h-64 object-cover rounded-lg shadow"
                            />
                            
                            {/* Predictions */}
                            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-2">Predictions</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>Bean Type: <span className="font-medium">{image.predictions.bean_type}</span></div>
                                    <div>Area: <span className="font-medium">{image.predictions.area.toFixed(2)}</span></div>
                                    <div>Perimeter: <span className="font-medium">{image.predictions.perimeter.toFixed(2)}</span></div>
                                    <div>Solidity: <span className="font-medium">{image.predictions.solidity.toFixed(3)}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Annotation Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Validation Status
                                </label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="validation"
                                            checked={validated}
                                            onChange={() => setValidated(true)}
                                            className="mr-2"
                                        />
                                        Validated
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="validation"
                                            checked={!validated}
                                            onChange={() => setValidated(false)}
                                            className="mr-2"
                                        />
                                        Not Yet Validated
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Alleged Variety (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={allegedVariety}
                                    onChange={(e) => setAllegedVariety(e.target.value)}
                                    placeholder="e.g., Arabica Premium, Robusta Supreme"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add any additional observations..."
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Confirmation */}
                            {showConfirmation && allegedVariety && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <div className="flex">
                                        <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <h4 className="text-sm font-medium text-yellow-800">Confirm Alleged Variety</h4>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                You are setting the alleged variety to "<strong>{allegedVariety}</strong>". 
                                                This will be recorded permanently. Continue?
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    {showConfirmation ? 'Confirm & Save' : 'Save Annotation'}
                                </button>
                                <button
                                    onClick={showConfirmation ? () => setShowConfirmation(false) : onClose}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    {showConfirmation ? 'Cancel' : 'Close'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResearcherAnnotations;
