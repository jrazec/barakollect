import React, { useState, useEffect } from 'react';
import { AdminService } from '@/services/adminService';
import type { AdminPredictedImage, AdminImageFilters, PaginationData } from '@/interfaces/global';
import ImageDetailsModal from './ImageDetailsModal';
import GalleryComponent from './GalleryComponent';

type FolderViewMode = 'grid' | 'list';
type SortOrder = 'asc' | 'desc';

const AdminBeansGallery: React.FC = () => {
    const [folderViewMode, setFolderViewMode] = useState<FolderViewMode>('grid');
    const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
    const [statusFilter, setStatusFilter] = useState<'verified' | 'pending' | 'all'>('all');
    const [filters, setFilters] = useState<AdminImageFilters>({});
    const [images, setImages] = useState<AdminPredictedImage[]>([]);
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [pagination, setPagination] = useState<PaginationData>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 100
    });
    const [locations, setLocations] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<AdminPredictedImage | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch data
    useEffect(() => {
        loadImages();
        loadLocations();
    }, [statusFilter, filters, pagination.currentPage]);

    const loadImages = async () => {
        setIsLoading(true);
        try {
            const status = statusFilter === 'all' ? undefined : statusFilter;
            const result = await AdminService.getImagesByStatus(
                status, 
                filters, 
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

    const loadLocations = async () => {
        try {
            const locations = await AdminService.getUniqueLocations();
            setLocations(locations);
        } catch (error) {
            console.error('Error loading locations:', error);
        }
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handleFilterChange = (key: keyof AdminImageFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value || undefined }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                await AdminService.deleteImage(id);
                loadImages(); // Refresh the list
            } catch (error) {
                console.error('Error deleting image:', error);
                alert('Failed to delete image. Please try again.');
            }
        }
    };

    const handleSaveEdit = async (updatedImage: AdminPredictedImage) => {
        try {
            await AdminService.editImage(updatedImage.id, updatedImage);
            loadImages(); // Refresh the list
            setIsModalOpen(false);
            setSelectedImage(null);
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving image:', error);
            alert('Failed to save changes. Please try again.');
        }
    };

    // Group images by user for grid/list view with sorting
    const groupedImages = React.useMemo(() => {
        return images.reduce((groups, image) => {
            const key = `${image.userId}-${image.userName}`;
            if (!groups[key]) {
                groups[key] = {
                    userId: image.userId,
                    userName: image.userName,
                    userRole: image.userRole,
                    images: []
                };
            }
            groups[key].images.push(image);
            return groups;
        }, {} as Record<string, { userId: string; userName: string; userRole: string; images: AdminPredictedImage[] }>);
    }, [images]);

    // Sort grouped images by upload count with stable sorting
    const sortedGroupedImages = React.useMemo(() => {
        return Object.values(groupedImages).sort((a, b) => {
            const countA = a.images.length;
            const countB = b.images.length;
            
            // Primary sort by count
            const countDiff = sortOrder === 'asc' ? countA - countB : countB - countA;
            
            // Secondary sort by userName for stability when counts are equal
            if (countDiff === 0) {
                return a.userName.localeCompare(b.userName);
            }
            
            return countDiff;
        });
    }, [groupedImages, sortOrder]);

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        // Reset open folders when sort order changes to prevent confusion
        setOpenFolders(new Set());
    };

    const toggleFolder = (folderId: string) => {
        setOpenFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folderId)) {
                newSet.delete(folderId);
            } else {
                newSet.add(folderId);
            }
            return newSet;
        });
    };

    return (
        <div className="p-6 bg-white">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Beans Gallery Management</h1>
                <p className="text-gray-600">Manage and review all submitted bean images across the platform</p>
            </div>

            {/* Filters and Controls */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Status Filter */}
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Status:</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as 'verified' | 'pending' | 'all')}
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All</option>
                                <option value="verified">Validated</option>
                                <option value="pending">Not Yet Validated</option>
                            </select>
                        </div>

                        {/* Farm Filter */}
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Farm:</label>
                            <select
                                value={filters.farm || ''}
                                onChange={(e) => handleFilterChange('farm', e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Farms</option>
                                {locations.map(location => (
                                    <option key={location} value={location}>{location}</option>
                                ))}
                            </select>
                        </div>

                        {/* Role Filter */}
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Role:</label>
                            <select
                                value={filters.role || ''}
                                onChange={(e) => handleFilterChange('role', e.target.value as 'farmer' | 'researcher')}
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Roles</option>
                                <option value="farmer">Farmers</option>
                                <option value="researcher">Researchers</option>
                            </select>
                        </div>
                    </div>

                    {/* Sort by Upload Count */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Sort by Upload Count:</span>
                        <button
                            onClick={toggleSortOrder}
                            className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition-colors"
                        >
                            <span>{sortOrder === 'desc' ? 'Most to Least' : 'Least to Most'}</span>
                            <svg 
                                className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Folder View Mode Toggle */}
            <div className="mb-4 flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">View Mode:</span>
                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                    <button
                        onClick={() => setFolderViewMode('grid')}
                        className={`px-3 py-1 text-sm ${folderViewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                        </svg>
                        Grid
                    </button>
                    <button
                        onClick={() => setFolderViewMode('list')}
                        className={`px-3 py-1 text-sm border-l border-gray-300 ${folderViewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path>
                        </svg>
                        List
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">Loading images...</span>
                </div>
            )}

            {/* Content */}
            {!isLoading && (
                <>
                    {/* Folder View - Toggleable folders per user */}
                    <div className="space-y-4">
                        {sortedGroupedImages.map((userGroup) => {
                            const folderId = `${userGroup.userId}-${userGroup.userName}`;
                            const isOpen = openFolders.has(folderId);
                            
                            return (
                                <div key={folderId} className="bg-white rounded-lg shadow border border-gray-200">
                                    {/* User Folder Header - Clickable */}
                                    <div 
                                        className="p-4 bg-gray-50 rounded-t-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => toggleFolder(folderId)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <svg 
                                                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} 
                                                    fill="currentColor" 
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                                </svg>
                                                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                                                </svg>
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">{userGroup.userName}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {userGroup.userRole.charAt(0).toUpperCase() + userGroup.userRole.slice(1)} • {userGroup.images.length} images
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {isOpen ? 'Click to collapse' : 'Click to expand'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* User's Images - Collapsible with animation */}
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                        {isOpen && (
                                            <div className="p-4 border-t border-gray-200">
                                                <div className="h-80 overflow-y-auto">
                                                    <GalleryComponent
                                                        images={userGroup.images.map(img => ({
                                                            id: img.id,
                                                            src: img.src,
                                                            bean_type: img.predictions.bean_type,
                                                            is_validated: img.validated === 'verified',
                                                            location: img.locationName,
                                                            predictions: img.predictions,
                                                            userName: img.userName,
                                                            userRole: img.userRole,
                                                            submissionDate: img.submissionDate
                                                        }))}
                                                        type="admin"
                                                        onDeleteImage={handleDelete}
                                                        customViewMode={folderViewMode}
                                                        showViewToggle={false}
                                                        maxHeight="320px"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                                {pagination.totalItems} results
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
                </>
            )}

            {/* Modal */}
            {selectedImage && (
                <ImageDetailsModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedImage(null);
                        setIsEditing(false);
                    }}
                    image={{
                        id: selectedImage.id,
                        src: selectedImage.src,
                        bean_type: selectedImage.predictions.bean_type,
                        is_validated: selectedImage.validated === 'verified',
                        location: selectedImage.locationName,
                        predictions: selectedImage.predictions,
                        userName: selectedImage.userName,
                        userRole: selectedImage.userRole,
                        submissionDate: selectedImage.submissionDate
                    }}
                    type="admin"
                    isEditing={isEditing}
                    onSave={handleSaveEdit}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default AdminBeansGallery;
