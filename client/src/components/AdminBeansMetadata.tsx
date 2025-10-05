import React, { useState, useEffect } from 'react';
import { AdminService } from '@/services/adminService';
import type { AdminPredictedImage, AdminImageFilters, PaginationData } from '@/interfaces/global';
import ImageDetailsModal from './ImageDetailsModal';
import EnhancedImageDetailsModal from './EnhancedImageDetailsModal';
import EnhancedImageEditModal from './EnhancedImageEditModal';
import TableComponent, { type TableColumn } from './TableComponent';

const AdminBeansMetadata: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<'verified' | 'pending' | 'all'>('all');
    const [filters, setFilters] = useState<AdminImageFilters>({});
    const [searchQueries, setSearchQueries] = useState({
        search_owner: '',
        search_image_id: ''
    });
    const [images, setImages] = useState<AdminPredictedImage[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNext: false,
        hasPrevious: false
    });
    const [locations, setLocations] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<AdminPredictedImage | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<string | null>(null);

    // Load data on pagination change only
    useEffect(() => {
        loadImages();
    }, [pagination.currentPage]);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadImages();
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [statusFilter, filters, searchQueries]);

    // Load locations only once on mount
    useEffect(() => {
        loadLocations();
    }, []);

    const loadImages = async () => {
        setIsLoading(true);
        try {
            const status = statusFilter === 'all' ? undefined : statusFilter;
            
            // Build search parameters - only include non-empty search values
            const searchParams: any = {};
            if (searchQueries.search_owner.trim()) searchParams.search_owner = searchQueries.search_owner.trim();
            if (searchQueries.search_image_id.trim()) searchParams.search_image_id = searchQueries.search_image_id.trim();
            
            const result = await AdminService.getImagesByStatus(
                status, 
                filters, 
                pagination.currentPage, 
                pagination.itemsPerPage,
                Object.keys(searchParams).length > 0 ? searchParams : undefined
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
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
    };

    const handleSearchChange = (searchType: keyof typeof searchQueries, value: string) => {
        setSearchQueries(prev => ({ ...prev, [searchType]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page when searching
    };

    const handleStatusFilterChange = (status: 'verified' | 'pending' | 'all') => {
        setStatusFilter(status);
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
    };

    const handleImageClick = (image: AdminPredictedImage) => {
        setSelectedImage(image);
        setIsModalOpen(true);
        setIsEditing(false);
    };

    const handleEdit = (image: AdminPredictedImage) => {
        setSelectedImage(image);
        // Only open the new edit modal for images with multi-bean predictions
        if (image.predictions && Array.isArray(image.predictions)) {
            setIsEditModalOpen(true);
        } else {
            // Fallback to old modal for legacy single-bean predictions
            setIsModalOpen(true);
            setIsEditing(true);
        }
    };

    const handleDeleteClick = (id: string) => {
        setImageToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (imageToDelete) {
            try {
                await AdminService.deleteImage(imageToDelete);
                // Refresh only the table data
                await loadImages();
                setShowDeleteModal(false);
                setImageToDelete(null);
            } catch (error) {
                console.error('Error deleting image:', error);
                alert('Failed to delete image. Please try again.');
            }
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setImageToDelete(null);
    };

    const handleSaveEdit = async (updatedImage: AdminPredictedImage) => {
        try {
            await AdminService.editImage(updatedImage.id, updatedImage);
            // Refresh only the table data
            await loadImages();
            setIsModalOpen(false);
            setSelectedImage(null);
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving image:', error);
            alert('Failed to save changes. Please try again.');
        }
    };

    const handleValidateBean = async (beanId: number, updatedBean: any) => {
        try {
            // TODO: Replace with actual API endpoint
            const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/beans/validate/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bean_id: beanId,
                    image_id: selectedImage?.id,
                    ...updatedBean
                })
            });

            if (response.status === 200) {
                // Refresh only the table data after successful validation
                await loadImages();
                console.log('Bean validated successfully');
            } else {
                console.error('Failed to validate bean');
                alert('Failed to validate bean. Please try again.');
            }
        } catch (error) {
            console.error('Error validating bean:', error);
            alert('Error validating bean. Please try again.');
        }
    };

    // Table columns definition
    const columns: TableColumn[] = [
        {
            key: 'id',
            label: 'ID',
            width: 'w-1/12'
        },
        {
            key: 'imagePreview',
            label: 'Image',
            width: 'w-1/6',
            render: (_, row) => (
                <img
                    src={row.src}
                    alt={`Bean submitted by ${row.userName}`}
                    className="h-16 w-16 object-cover rounded-md border border-gray-200 cursor-pointer"
                    onClick={() => handleImageClick(row)}
                />
            )
        },
        {
            key: 'userName',
            label: 'Owner',
            width: 'w-1/6'
        },
        {
            key: 'userRole',
            label: 'Role',
            width: 'w-1/6',
            render: (value) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    value === 'farmer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
            )
        },
        {
            key: 'bean_type',
            label: 'Bean Count/Type',
            width: 'w-1/6',
            render: (_, row) => {
                // Handle both legacy and new formats
                let beanType = 'Unknown';
                if (row.bean_type) {
                    // Legacy single bean prediction
                    beanType = row.bean_type;
                } else if (row.predictions) {
                    if (Array.isArray(row.predictions)) {
                        // New multi-bean format - show first bean type or count
                        beanType = row.predictions.length > 0 
                            ? row.predictions.length === 1 
                                ? row.predictions[0].bean_type 
                                : `${row.predictions.length} beans detected`
                            : 'No beans detected';
                    } else {
                        // Legacy prediction object format
                        beanType = row.predictions.bean_type || 'Unknown';
                    }
                }
                return (
                    <div className="text-sm text-[var(--espresso-black)]">{beanType}</div>
                );
            }
        },
        {
            key: 'is_validated',
            label: 'Status',
            width: 'w-1/6',
            render: (value) => {
                const isValidated = value === true;
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isValidated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        {isValidated ? 'Verified' : 'Pending'}
                    </span>
                );
            }
        },
        {
            key: 'locationName',
            label: 'Location',
            width: 'w-1/6'
        },
        {
            key: 'actions',
            label: 'Actions',
            width: 'w-1/6',
            render: (_, row) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-green-600 hover:text-green-900 font-accent text-sm"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row.id)}
                        className="text-red-600 hover:text-red-900 font-accent text-sm"
                    >
                        Delete
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-main font-bold text-[var(--espresso-black)] mb-2">
                        Beans Metadata Management
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 font-accent">
                        View and manage detailed metadata for all submitted bean images
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-[var(--parchment)] rounded-lg shadow p-4 sm:p-6 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {/* Search Owner */}
                        <div>
                            <label className="block text-sm font-accent text-gray-600 mb-2">Search Owner</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by user name..."
                                    value={searchQueries.search_owner}
                                    onChange={(e) => handleSearchChange('search_owner', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent pl-8"
                                />
                                <svg 
                                    className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Search Image ID */}
                        <div>
                            <label className="block text-sm font-accent text-gray-600 mb-2">Search Image ID</label>
                            <input
                                type="text"
                                placeholder="Enter image ID..."
                                value={searchQueries.search_image_id}
                                onChange={(e) => handleSearchChange('search_image_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-accent text-gray-600 mb-2">Filter by Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusFilterChange(e.target.value as 'verified' | 'pending' | 'all')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
                            >
                                <option value="all">All Statuses</option>
                                <option value="verified">Verified</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>

                        {/* Farm Filter */}
                        <div>
                            <label className="block text-sm font-accent text-gray-600 mb-2">Filter by Farm</label>
                            <select
                                value={filters.farm || ''}
                                onChange={(e) => handleFilterChange('farm', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
                            >
                                <option value="">All Farms</option>
                                {locations.map(location => (
                                    <option key={location} value={location}>{location}</option>
                                ))}
                            </select>
                        </div>

                        {/* Role Filter */}
                        <div>
                            <label className="block text-sm font-accent text-gray-600 mb-2">Filter by Role</label>
                            <select
                                value={filters.role || ''}
                                onChange={(e) => handleFilterChange('role', e.target.value as 'farmer' | 'researcher')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
                            >
                                <option value="">All Roles</option>
                                <option value="farmer">Farmers</option>
                                <option value="researcher">Researchers</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--arabica-brown)] mx-auto mb-4"></div>
                            <p className="text-gray-600 font-accent">Loading images...</p>
                        </div>
                    </div>
                )}

                {/* Images Table with integrated pagination */}
                {!isLoading && (
                    <div className="bg-[var(--parchment)] rounded-lg shadow overflow-hidden">
                        <TableComponent
                            columns={columns}
                            data={images}
                            className="min-h-[400px]"
                            pagination={{
                                currentPage: pagination.currentPage,
                                totalPages: pagination.totalPages,
                                totalItems: pagination.totalItems,
                                itemsPerPage: pagination.itemsPerPage,
                                hasNext: pagination.hasNext,
                                hasPrevious: pagination.hasPrevious,
                                onPageChange: handlePageChange
                            }}
                            showPaginationTop={true}
                        />
                    </div>
                )}
            </div>

            {/* View/Edit Modals */}
            {selectedImage && (
                <>
                    {/* Enhanced Edit Modal for multi-bean predictions */}
                    {selectedImage.predictions && Array.isArray(selectedImage.predictions) && (
                        <EnhancedImageEditModal
                            isOpen={isEditModalOpen}
                            onClose={() => {
                                setIsEditModalOpen(false);
                                setSelectedImage(null);
                            }}
                            image={{
                                id: selectedImage.id,
                                src: selectedImage.src,
                                predictions: selectedImage.predictions,
                                submissionDate: selectedImage.submissionDate,
                                allegedVariety: selectedImage.allegedVariety || undefined,
                                userName: selectedImage.userName,
                                userRole: selectedImage.userRole
                            }}
                            userRole="admin"
                            onValidateBean={handleValidateBean}
                        />
                    )}

                    {/* Enhanced View Modal for multi-bean predictions */}
                    {selectedImage.predictions && Array.isArray(selectedImage.predictions) ? (
                        <EnhancedImageDetailsModal
                            isOpen={isModalOpen}
                            onClose={() => {
                                setIsModalOpen(false);
                                setSelectedImage(null);
                                setIsEditing(false);
                            }}
                            image={{
                                id: selectedImage.id,
                                src: selectedImage.src,
                                predictions: selectedImage.predictions,
                                submissionDate: selectedImage.submissionDate,
                                allegedVariety: selectedImage.allegedVariety || undefined,
                                userName: selectedImage.userName,
                                userRole: selectedImage.userRole
                            }}
                            userRole="admin"
                        />
                    ) : (
                        /* Legacy modal for single-bean predictions */
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
                                userId: selectedImage.userId,
                                userName: selectedImage.userName,
                                userRole: selectedImage.userRole,
                                locationId: selectedImage.locationId,
                                locationName: selectedImage.locationName,
                                submissionDate: selectedImage.submissionDate,
                                is_validated: selectedImage.is_validated,
                                allegedVariety: selectedImage.allegedVariety || undefined,
                                bean_type: selectedImage.bean_type,
                                predictions: selectedImage.predictions
                            }}
                            type="admin"
                            isEditing={isEditing}
                            onSave={handleSaveEdit}
                            onDelete={handleDeleteClick}
                        />
                    )}
                </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-[var(--parchment)]">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <svg 
                                    className="h-6 w-6 text-red-600" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth="2" 
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg leading-6 font-main font-bold text-[var(--espresso-black)] mt-4">Delete Image</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-600 font-accent">
                                    Are you sure you want to delete this image? This action cannot be undone.
                                </p>
                            </div>
                            <div className="items-center px-4 py-3 flex justify-center space-x-4">
                                <button
                                    onClick={handleDeleteCancel}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-[var(--espresso-black)] font-accent hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-accent hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBeansMetadata;
