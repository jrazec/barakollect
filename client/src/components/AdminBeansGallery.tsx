import React, { useState, useEffect } from 'react';
import { useCachedAdminService } from '@/hooks/useCachedServices';
import type { AdminPredictedImage, AdminImageFilters, PaginationData } from '@/interfaces/global';
import JSZip from "jszip";
import { saveAs } from "file-saver";
import GalleryComponent from './GalleryComponent';

const AdminBeansGallery: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<'verified' | 'pending' | 'all'>('all');
    const [filters, setFilters] = useState<AdminImageFilters>({});
    const [images, setImages] = useState<AdminPredictedImage[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 2000
    });
    const [locations, setLocations] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize cached services
    const cachedAdminService = useCachedAdminService();

    // Fetch data
    useEffect(() => {
        loadImages();
        loadLocations();
    }, [statusFilter, filters, pagination.currentPage]);

    const loadImages = async () => {
        setIsLoading(true);
        try {
            const status = statusFilter === 'all' ? undefined : statusFilter;
            const result = await cachedAdminService.getImagesByStatus(
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
            const locations = await cachedAdminService.getUniqueLocations();
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
                await cachedAdminService.deleteImage(id);
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
            
            const zip = new JSZip();

            const fetchPromises = images.map(async (img, index) => {
                const response = await fetch(img.src);
                const blob = await response.blob();

                // Extract path after `/uploads/`
                const afterUploads = img.src.split("/uploads/")[1]; 
                // e.g. "user-uuid/file-name.png?..."

                // Split into parts
                const [userFolder, rawFileName] = afterUploads.split("/");
                let fileName = rawFileName.split("?")[0]; // remove query params

                // Create user-speciafic folder (auto-created if doesn’t exist)
                const userZipFolder = zip.folder(userFolder);

                // Add the file inside that user's folder
                userZipFolder?.file(fileName, blob);
            });

            await Promise.all(fetchPromises);
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, "beans-images-by-user.zip");

            alert(`Starting download of ${images.length} images${folderName ? ` from ${folderName}` : ''}`);
        } catch (error) {
            console.error('Error downloading images:', error);
            alert('Failed to download images. Please try again.');
        }
    };

    const handleDownloadImageDetails = async (images: any[], folderName?: string) => {
        try {
            console.log('Downloading image details:', images.length, folderName ? `for folder: ${folderName}` : 'for all folders');
            
            // Flatten all bean records from all images
            const allBeanRecords: any[] = [];
            
            images.forEach(img => {
                if (img.predictions && Array.isArray(img.predictions)) {
                    // Handle new multi-bean format
                    img.predictions.forEach((prediction: any) => {
                        allBeanRecords.push({
                            bean_id: prediction.bean_id || '',
                            is_validated: prediction.is_validated || false,
                            bean_type: prediction.bean_type || '',
                            confidence: prediction.confidence || 0,
                            length_mm: prediction.length_mm || 0,
                            width_mm: prediction.width_mm || 0,
                            bbox: Array.isArray(prediction.bbox) ? `"[${prediction.bbox.join(', ')}]"` : '[]',
                            comment: prediction.comment || '',
                            detection_date: prediction.detection_date || '',
                            // Extract features from nested features object
                            area_mm2: prediction.features?.area_mm2 || 0,
                            perimeter_mm: prediction.features?.perimeter_mm || 0,
                            major_axis_length: prediction.features?.major_axis_length_mm || 0,
                            minor_axis_length: prediction.features?.minor_axis_length_mm || 0,
                            extent: prediction.features?.extent || 0,
                            eccentricity: prediction.features?.eccentricity || 0,
                            convex_area: prediction.features?.convex_area || 0,
                            solidity: prediction.features?.solidity || 0,
                            mean_intensity: prediction.features?.mean_intensity || 0,
                            equivalent_diameter_mm: prediction.features?.equivalent_diameter_mm || 0,
                            extracted_feature_id: prediction.extracted_feature_id || '',
                            image_id: img.id || '',
                            src: img.src || '',
                            userId: img.userId || '',
                            userName: img.userName || '',
                            userRole: img.userRole || '',
                            locationId: img.locationId || '',
                            locationName: img.locationName || '',
                            submissionDate: img.submissionDate || ''
                        });
                    });
                } else if (img.predictions && typeof img.predictions === 'object') {
                    // Handle legacy single-bean format
                    allBeanRecords.push({
                        bean_id: 1, // Default for legacy format
                        is_validated: img.is_validated || false,
                        bean_type: img.bean_type || img.predictions.bean_type || '',
                        confidence: 0, // Not available in legacy format
                        length_mm: 0, // Not available in legacy format
                        width_mm: 0, // Not available in legacy format
                        bbox: '[]', // Not available in legacy format
                        comment: '',
                        detection_date: img.submissionDate || '',
                        area_mm2: img.predictions.area || 0,
                        perimeter_mm: img.predictions.perimeter || 0,
                        major_axis_length: img.predictions.major_axis_length || 0,
                        minor_axis_length: img.predictions.minor_axis_length || 0,
                        extent: img.predictions.extent || 0,
                        eccentricity: img.predictions.eccentricity || 0,
                        convex_area: img.predictions.convex_area || 0,
                        solidity: img.predictions.solidity || 0,
                        mean_intensity: img.predictions.mean_intensity || 0,
                        equivalent_diameter_mm: img.predictions.equivalent_diameter || 0,
                        extracted_feature_id: '',
                        image_id: img.id || '',
                        src: img.src || '',
                        userId: img.userId || '',
                        userName: img.userName || '',
                        userRole: img.userRole || '',
                        locationId: img.locationId || '',
                        locationName: img.locationName || '',
                        submissionDate: img.submissionDate || ''
                    });
                } else {
                    // Handle images without predictions
                    allBeanRecords.push({
                        bean_id: '',
                        is_validated: img.is_validated || false,
                        bean_type: img.bean_type || '',
                        confidence: 0,
                        length_mm: 0,
                        width_mm: 0,
                        bbox: '[]',
                        comment: '',
                        detection_date: img.submissionDate || '',
                        area_mm2: 0,
                        perimeter_mm: 0,
                        major_axis_length: 0,
                        minor_axis_length: 0,
                        extent: 0,
                        eccentricity: 0,
                        convex_area: 0,
                        solidity: 0,
                        mean_intensity: 0,
                        equivalent_diameter_mm: 0,
                        extracted_feature_id: '',
                        image_id: img.id || '',
                        src: img.src || '',
                        userId: img.userId || '',
                        userName: img.userName || '',
                        userRole: img.userRole || '',
                        locationId: img.locationId || '',
                        locationName: img.locationName || '',
                        submissionDate: img.submissionDate || ''
                    });
                }
            });

            if (allBeanRecords.length === 0) {
                alert('No bean records found to download.');
                return;
            }

            // Define the exact column order matching your JSON structure
            const headers = [
                'bean_id',
                'is_validated',
                'bean_type',
                'confidence',
                'length_mm',
                'width_mm',
                'bbox',
                'comment',
                'detection_date',
                'area_mm2',
                'perimeter_mm',
                'major_axis_length',
                'minor_axis_length',
                'extent',
                'eccentricity',
                'convex_area',
                'solidity',
                'mean_intensity',
                'equivalent_diameter_mm',
                'extracted_feature_id',
                'image_id',
                'src',
                'userId',
                'userName',
                'userRole',
                'locationId',
                'locationName',
                'submissionDate'
            ];

            // Create CSV content
            const csvContent = [
                headers.join(','),
                ...allBeanRecords.map(record => 
                    headers.map(header => {
                        const value = record[header];
                        // Handle special formatting for CSV
                        if (value === null || value === undefined) {
                            return '';
                        }
                        // Don't quote bbox as it's already quoted
                        if (header === 'bbox') {
                            return value;
                        }
                        // Quote strings that might contain commas
                        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                            return `"${value.replace(/"/g, '""')}"`;
                        }
                        return value;
                    }).join(',')
                )
            ].join('\n');

            // Download CSV
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `beans-metadata${folderName ? `-${folderName}` : '-all'}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            alert(`Downloaded ${allBeanRecords.length} bean records${folderName ? ` from ${folderName}` : ''}`);
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
