import React, { useState, useEffect } from 'react';
import { useCachedAdminService } from '@/hooks/useCachedServices';
import { useCache } from '@/contexts/CacheContext';
import type { AdminPredictedImage, AdminImageFilters, PaginationData } from '@/interfaces/global';
import ImageDetailsModal from './ImageDetailsModal';
import EnhancedImageDetailsModal from './EnhancedImageDetailsModal';
import EnhancedImageEditModal from './EnhancedImageEditModal';
import TableComponent, { type TableColumn } from './TableComponent';
import JSZip from 'jszip';

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
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadType, setUploadType] = useState<'csv' | 'zip' | null>(null);

    const cachedAdminService = useCachedAdminService();
    const cache = useCache();

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
            
            const result = await cachedAdminService.getImagesByStatus(
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
                await cachedAdminService.deleteImage(imageToDelete);
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

    const handleUploadClick = () => {
        setShowUploadModal(true);
        setUploadProgress(0);
        setUploadFile(null);
        setUploadType(null);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            if (fileExtension === 'csv' || fileExtension === 'tsv') {
                setUploadType('csv');
                setUploadFile(file);
            } else if (fileExtension === 'zip') {
                setUploadType('zip');
                setUploadFile(file);
            } else {
                alert('Please select a CSV, TSV, or ZIP file.');
                event.target.value = '';
            }
        }
    };

    const processCsvFile = async (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    const lines = text.split('\n').filter(line => line.trim());
                    
                    // Detect delimiter (tab or comma)
                    const firstLine = lines[0];
                    const delimiter = firstLine.includes('\t') ? '\t' : ',';
                    
                    const headers = firstLine.split(delimiter).map(h => h.trim());
                    
                    const jsonData = lines.slice(1).map(line => {
                        const values = line.split(delimiter).map(v => v.trim());
                        const row: any = {};
                        
                        headers.forEach((header, index) => {
                            const value = values[index] || '';
                            
                            // Convert specific fields to appropriate types based on the CSV example
                            if (header === 'bean_id' || header === 'extracted_feature_id' || header === 'image_id') {
                                row[header] = value ? parseInt(value) : null;
                            } else if (header === 'is_validated') {
                                row[header] = value.toUpperCase() === 'TRUE';
                            } else if (['confidence', 'length_mm', 'width_mm'].includes(header)) {
                                row[header] = value ? parseFloat(value) : 0;
                            } else if (header === 'bbox') {
                                try {
                                    // Handle both JSON array format and string format
                                    if (value.startsWith('[') && value.endsWith(']')) {
                                        row[header] = JSON.parse(value);
                                    } else {
                                        row[header] = [0, 0, 0, 0];
                                    }
                                } catch {
                                    row[header] = [0, 0, 0, 0];
                                }
                            } else if (['area_mm2', 'perimeter_mm', 'major_axis_length', 'minor_axis_length', 
                                       'extent', 'eccentricity', 'convex_area', 'solidity', 'mean_intensity', 
                                       'equivalent_diameter_mm'].includes(header)) {
                                // Group morphological features into nested structure for backend
                                if (!row.features) row.features = {};
                                row.features[header] = value ? parseFloat(value) : 0;
                            } else if (header === 'detection_date' || header === 'submissionDate') {
                                // Keep date strings as is
                                row[header] = value;
                            } else if (header === 'locationId') {
                                row[header] = value ? parseInt(value) : null;
                            } else {
                                // String fields - remove any surrounding quotes
                                row[header] = value.replace(/^["']|["']$/g, '');
                            }
                        });
                        
                        // Create proper structure for backend processing
                        const processedRow = {
                            user_id: row.userId,
                            image_url: row.src,
                            location_name: row.locationName,
                            bean_type: row.bean_type,
                            is_validated: row.is_validated,
                            confidence: row.confidence,
                            features: row.features,
                            bean_detection: {
                                bean_id: row.bean_id,
                                length_mm: row.length_mm,
                                width_mm: row.width_mm,
                                bbox: row.bbox,
                                comment: row.comment || ''
                            }
                        };
                        
                        return processedRow;
                    });
                    
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    };

    const processZipFile = async (file: File): Promise<{ [userId: string]: File[] }> => {
        return new Promise(async (resolve, reject) => {
            try {
                const zip = new JSZip();
                const contents = await zip.loadAsync(file);
                const userFiles: { [userId: string]: File[] } = {};

                const promises = Object.keys(contents.files).map(async (filename) => {
                    const fileData = contents.files[filename];
                    if (!fileData.dir && filename.includes('/')) {
                        const pathParts = filename.split('/');
                        if (pathParts.length >= 2) {
                            const userId = pathParts[pathParts.length - 2]; // Get the folder name as userId
                            const fileName = pathParts[pathParts.length - 1];
                            
                            if (fileName && !fileName.startsWith('.')) {
                                const blob = await fileData.async('blob');
                                const file = new File([blob], fileName, { type: blob.type });
                                
                                if (!userFiles[userId]) {
                                    userFiles[userId] = [];
                                }
                                userFiles[userId].push(file);
                            }
                        }
                    }
                });

                await Promise.all(promises);
                resolve(userFiles);
            } catch (error) {
                reject(error);
            }
        });
    };

    const handleUploadConfirm = async () => {
        if (!uploadFile || !uploadType) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            let uploadData: any;

            if (uploadType === 'csv') {
                setUploadProgress(10);
                uploadData = await processCsvFile(uploadFile);
                setUploadProgress(25);
                
                // Send CSV data (already processed as JSON) to upload-records endpoint
                const result = await cachedAdminService.uploadRecords(
                    uploadData, 
                    'csv', 
                    (progress) => setUploadProgress(progress)
                );
                
                if (result.success) {
                    alert(`CSV file uploaded successfully! ${result.message}`);
                    setShowUploadModal(false);
                    // Refresh the table data
                    await loadImages();
                }
                
            } else if (uploadType === 'zip') {
                setUploadProgress(10);
                // For ZIP files, we send the file directly to upload-images endpoint
                uploadData = {
                    file: uploadFile,
                    user_id: null // Add user context if available
                };
                
                const result = await cachedAdminService.uploadRecords(
                    uploadData, 
                    'zip', 
                    (progress) => setUploadProgress(progress)
                );
                
                if (result.success) {
                    alert(`ZIP file uploaded successfully! ${result.message}`);
                    setShowUploadModal(false);
                    // Refresh the table data
                    await loadImages();
                }
            }
            
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            alert(`Failed to upload ${uploadType?.toUpperCase()} file: ${errorMessage}`);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            setUploadFile(null);
            setUploadType(null);
        }
    };

    const handleUploadCancel = () => {
        setShowUploadModal(false);
        setUploadProgress(0);
        setUploadFile(null);
        setUploadType(null);
        setIsUploading(false);
    };

    const handleDownloadRecords = async () => {
        try {
            // Get all images without pagination for complete download
            const status = statusFilter === 'all' ? undefined : statusFilter;
            
            // Build search parameters - only include non-empty search values
            const searchParams: any = {};
            if (searchQueries.search_owner.trim()) searchParams.search_owner = searchQueries.search_owner.trim();
            if (searchQueries.search_image_id.trim()) searchParams.search_image_id = searchQueries.search_image_id.trim();
            
            // Get all images (use a large page size to get all records)
            const result = await cachedAdminService.getImagesByStatus(
                status, 
                filters, 
                1, 
                10000, // Large number to get all records
                Object.keys(searchParams).length > 0 ? searchParams : undefined
            );
            
            const allImages = result.images;
            
            if (allImages.length === 0) {
                alert('No records found to download.');
                return;
            }

            // Flatten all bean records from all images
            const allBeanRecords: any[] = [];
            
            allImages.forEach(img => {
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
                            bbox: prediction.bbox || [], // Keep as array for proper JSON formatting
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
                        bbox: [], // Empty array for legacy format
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
                        bbox: [], // Empty array for no predictions
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

            // Create CSV content with tab separation to match the example format
            const csvContent = [
                headers.join('\t'),
                ...allBeanRecords.map(record => 
                    headers.map(header => {
                        const value = record[header];
                        // Handle special formatting for CSV to match the example
                        if (value === null || value === undefined) {
                            return '';
                        }
                        // Format boolean values as TRUE/FALSE
                        if (header === 'is_validated') {
                            return value ? 'TRUE' : 'FALSE';
                        }
                        // Format bbox as JSON array string
                        if (header === 'bbox') {
                            return Array.isArray(value) ? JSON.stringify(value) : '[]';
                        }
                        // Return the value as is for other fields
                        return value;
                    }).join('\t')
                )
            ].join('\n');

            // Download TSV (Tab-Separated Values)
            const blob = new Blob([csvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Generate filename with current filters (use .tsv for tab-separated format)
            let filename = 'beans-metadata';
            if (statusFilter !== 'all') filename += `-${statusFilter}`;
            if (filters.farm) filename += `-${filters.farm}`;
            if (filters.role) filename += `-${filters.role}`;
            filename += `-${new Date().toISOString().split('T')[0]}.tsv`;
            
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            alert(`Downloaded ${allBeanRecords.length} bean records from ${allImages.length} images`);
        } catch (error) {
            console.error('Error downloading records:', error);
            alert('Failed to download records. Please try again.');
        }
    };

    const handleSaveEdit = async (updatedImage: AdminPredictedImage) => {
        try {
            await cachedAdminService.editImage(updatedImage.id, updatedImage);
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
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl sm:text-3xl font-main font-bold text-[var(--espresso-black)] mb-2">
                            Beans Metadata Management
                        </h1>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleDownloadRecords}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-accent flex items-center space-x-2"
                            >
                                <svg 
                                    className="w-4 h-4" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Download CSV</span>
                            </button>
                            {/* <button
                                onClick={handleUploadClick}
                                className="bg-[var(--arabica-brown)] text-[var(--parchment)] px-4 py-2 rounded-lg hover:bg-[var(--espresso-black)] transition-colors font-accent flex items-center space-x-2"
                            >
                                <svg 
                                    className="w-4 h-4" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span>Upload Records</span>
                            </button> */}
                        </div>
                    </div>
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

            {/* Upload Records Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-[var(--parchment)]">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg leading-6 font-main font-bold text-[var(--espresso-black)]">
                                    Upload Records
                                </h3>
                                {!isUploading && (
                                    <button
                                        onClick={handleUploadCancel}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="text-sm text-gray-600 font-accent">
                                    <p className="mb-2">Upload beans metadata records:</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                        <li><strong>CSV/TSV:</strong> Beans data with predictions and measurements</li>
                                        <li><strong>ZIP:</strong> Images organized by user folders (userId/images)</li>
                                    </ul>
                                </div>

                                {!uploadFile && !isUploading && (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <svg 
                                            className="mx-auto h-12 w-12 text-gray-400" 
                                            stroke="currentColor" 
                                            fill="none" 
                                            viewBox="0 0 48 48"
                                        >
                                            <path 
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                                                strokeWidth={2} 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                            />
                                        </svg>
                                        <div className="mt-2">
                                            <label htmlFor="file-upload" className="cursor-pointer">
                                                <span className="text-[var(--arabica-brown)] font-accent hover:text-[var(--espresso-black)]">
                                                    Click to upload
                                                </span>
                                                <input
                                                    id="file-upload"
                                                    name="file-upload"
                                                    type="file"
                                                    accept=".csv,.tsv,.zip"
                                                    className="sr-only"
                                                    onChange={handleFileSelect}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">CSV, TSV, or ZIP files only</p>
                                    </div>
                                )}

                                {uploadFile && !isUploading && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{uploadFile.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {(uploadFile.size / 1024 / 1024).toFixed(2)} MB • {uploadType?.toUpperCase()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setUploadFile(null);
                                                    setUploadType(null);
                                                }}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {isUploading && (
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-900">
                                                    Processing {uploadType?.toUpperCase()} file...
                                                </span>
                                                <span className="text-sm text-gray-600">{uploadProgress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-[var(--arabica-brown)] h-2 rounded-full transition-all duration-300 ease-out"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {uploadProgress < 25 && "Reading file..."}
                                                {uploadProgress >= 25 && uploadProgress < 50 && "Processing data..."}
                                                {uploadProgress >= 50 && uploadProgress < 75 && "Preparing upload..."}
                                                {uploadProgress >= 75 && uploadProgress < 100 && "Uploading to server..."}
                                                {uploadProgress === 100 && "Upload complete!"}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {!isUploading && (
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            onClick={handleUploadCancel}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-[var(--espresso-black)] font-accent hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUploadConfirm}
                                            disabled={!uploadFile}
                                            className="px-4 py-2 bg-[var(--arabica-brown)] text-[var(--parchment)] rounded-lg font-accent hover:bg-[var(--espresso-black)] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Upload
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
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
