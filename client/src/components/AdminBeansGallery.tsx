import React, { useState, useEffect } from 'react';
import { AdminService } from '@/services/adminService';
import type { AdminPredictedImage, AdminImageFilters, PaginationData } from '@/interfaces/global';
import GalleryComponent from './GalleryComponent';

const AdminBeansGallery: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<'verified' | 'pending' | 'all'>('all');
    const [filters, setFilters] = useState<AdminImageFilters>({});
    const [images, setImages] = useState<AdminPredictedImage[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 100
    });
    const [locations, setLocations] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    // Download functionality
    const handleDownloadImages = async (images: any[], folderName?: string) => {
        try {
            console.log('Downloading images:', images.length, folderName ? `for folder: ${folderName}` : 'for all folders');
            // Implement actual download logic here
            // This would typically create a zip file with all images
            alert(`Starting download of ${images.length} images${folderName ? ` from ${folderName}` : ''}`);
        } catch (error) {
            console.error('Error downloading images:', error);
            alert('Failed to download images. Please try again.');
        }
    };

    const handleDownloadImageDetails = async (images: any[], folderName?: string) => {
        try {
            console.log('Downloading image details:', images.length, folderName ? `for folder: ${folderName}` : 'for all folders');
            
            // Create CSV data
            const csvData = images.map(img => ({
                id: img.id,
                userName: img.userName,
                userRole: img.userRole,
                location: img.locationName || img.location,
                submissionDate: img.submissionDate,
                isValidated: img.is_validated,
                allegedVariety: img.allegedVariety || '',
                beanType: img.bean_type || '',
                imageUrl: img.src,
                // Add prediction details if available
                ...(img.predictions && typeof img.predictions === 'object' ? {
                    predictionArea: img.predictions.area,
                    predictionPerimeter: img.predictions.perimeter,
                    predictionBeanType: img.predictions.bean_type
                } : {})
            }));

            // Convert to CSV
            const headers = Object.keys(csvData[0] || {});
            const csvContent = [
                headers.join(','),
                ...csvData.map(row => headers.map(header => `"${(row as any)[header] || ''}"`).join(','))
            ].join('\n');

            // Download CSV
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `image-details${folderName ? `-${folderName}` : '-all'}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading image details:', error);
            alert('Failed to download image details. Please try again.');
        }
    };

    // Convert images to format expected by GalleryComponent
    const convertedImages = images.map(img => ({
        ...img,
        location: img.locationName || '',
        allegedVariety: img.allegedVariety || undefined,
    }));

    return (
        <div className="p-6 bg-white h-full">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Beans Gallery Management</h1>
                <p className="text-gray-600">Manage and review all submitted bean images across the platform</p>
            </div>

            {/* Filters and Controls - If needed uncommnet */}
            {/* <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Status Filter */}
                        {/* <div className="flex items-center space-x-2">
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
                        </div> */}

                        {/* Farm Filter */}
                        {/* <div className="flex items-center space-x-2">
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
                        </div> */}

                        {/* Role Filter */}
                        {/* <div className="flex items-center space-x-2">
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
                        </div> */}
                    {/* </div>
                </div>
            </div> */}

            {/* Google Drive Style Gallery */}
            <GalleryComponent
                images={convertedImages}
                type="admin"
                isLoading={isLoading}
                enableFolderView={true}
                onDeleteImage={handleDelete}
                onDownloadImages={handleDownloadImages}
                onDownloadImageDetails={handleDownloadImageDetails}
                maxHeight="100%"
                
                showViewToggle={true}
            />

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
        </div>
    );
};

export default AdminBeansGallery;
