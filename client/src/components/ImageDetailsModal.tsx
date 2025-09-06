import React, { useState } from 'react';

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
};

type AdminImage = {
    id: string;
    src: string;
    bean_type: string;
    is_validated: boolean;
    location: string;
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
    userName: string;
    userRole: string;
    submissionDate: string;
};

type ImageDetailsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    image: PredictedImage | SubmittedImage | AdminImage;
    type: 'predicted' | 'submitted' | 'admin';
    isEditing?: boolean;
    onDelete?: (id: string) => void;
    onSave?: (updatedImage: any) => void;
};

const ImageDetailsModal: React.FC<ImageDetailsModalProps> = ({
    isOpen,
    onClose,
    image,
    type,
    isEditing = false,
    onDelete,
    onSave
}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editMode, setEditMode] = useState(isEditing);
    const [editedData, setEditedData] = useState<any>(image);

    if (!isOpen) return null;

    const handleDelete = async () => {
        if ((type === 'submitted' || type === 'admin') && onDelete && 'id' in image) {
            setIsDeleting(true);
            try {
                // Temporary API simulation - replace with actual endpoint
                await new Promise(resolve => setTimeout(resolve, 1000));
                onDelete(image.id);
                onClose();
            } catch (error) {
                console.error('Failed to delete image:', error);
                alert('Failed to delete image. Please try again.');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleSave = async () => {
        if (type === 'admin' && onSave) {
            setIsSaving(true);
            try {
                await onSave(editedData);
                setEditMode(false);
            } catch (error) {
                console.error('Failed to save changes:', error);
                alert('Failed to save changes. Please try again.');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleFieldChange = (field: string, value: any) => {
        setEditedData((prev: any) => ({ ...prev, [field]: value }));
    };

    const getTitle = () => {
        switch (type) {
            case 'predicted':
                return 'Coffee Bean Prediction Results';
            case 'submitted':
                return 'Submitted Image Details';
            case 'admin':
                return editMode ? 'Edit Image Details' : 'Image Details - Admin View';
            default:
                return 'Image Details';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {getTitle()}
                    </h2>
                    <div className="flex items-center space-x-2">
                        {type === 'admin' && !editMode && (
                            <button
                                onClick={() => setEditMode(true)}
                                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                            >
                                Edit
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Image Section */}
                        <div>
                            <img
                                src={image.src}
                                alt="Selected image"
                                className="w-full max-h-64 object-contain rounded-lg bg-gray-100"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.backgroundColor = '#f3f4f6';
                                    (e.target as HTMLImageElement).alt = 'Image failed to load';
                                }}
                            />
                        </div>

                        {/* Details Section */}
                        <div className="space-y-4">
                            {/* Admin-specific user information */}
                            {type === 'admin' && 'userName' in image && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h3 className="text-lg font-semibold text-blue-800 mb-2">User Information</h3>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm font-medium text-blue-600">Name:</span>
                                            <p className="text-blue-900">{image.userName}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-blue-600">Role:</span>
                                            <p className="text-blue-900 capitalize">{image.userRole}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-blue-600">Submission Date:</span>
                                            <p className="text-blue-900">{new Date(image.submissionDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bean Type and Validation Status */}
                            {(type === 'submitted' || type === 'admin') && 'bean_type' in image && (
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <h3 className="text-lg font-semibold text-green-800 mb-2">Classification</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm font-medium text-green-600">Bean Type:</span>
                                            {editMode && type === 'admin' ? (
                                                <select
                                                    value={editedData.bean_type || ''}
                                                    onChange={(e) => handleFieldChange('bean_type', e.target.value)}
                                                    className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
                                                >
                                                    <option value="Arabica">Arabica</option>
                                                    <option value="Robusta">Robusta</option>
                                                    <option value="Liberica">Liberica</option>
                                                </select>
                                            ) : (
                                                <p className="text-xl font-bold text-green-900">{image.bean_type}</p>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-green-600">Validation Status:</span>
                                            {editMode && type === 'admin' ? (
                                                <select
                                                    value={editedData.is_validated ? 'verified' : 'pending'}
                                                    onChange={(e) => handleFieldChange('is_validated', e.target.value === 'verified')}
                                                    className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
                                                >
                                                    <option value="verified">Verified</option>
                                                    <option value="pending">Pending</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-block ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                                                    image.is_validated 
                                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                }`}>
                                                    {image.is_validated ? '✓ Verified' : '⏳ Pending'}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-green-600">Location:</span>
                                            {editMode && type === 'admin' ? (
                                                <input
                                                    type="text"
                                                    value={editedData.location || ''}
                                                    onChange={(e) => handleFieldChange('location', e.target.value)}
                                                    className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1"
                                                />
                                            ) : (
                                                <p className="text-green-900">{image.location}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Predicted Image Bean Type */}
                            {type === 'predicted' && 'predictions' in image && (
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <h3 className="text-xl font-bold text-green-800 mb-2">
                                        Identified Bean Type: {image.predictions.bean_type}
                                    </h3>
                                    <p className="text-sm text-green-600">
                                        AI-powered analysis completed with high confidence
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Morphological Features */}
                    {((type === 'predicted' && 'predictions' in image) || (type === 'admin' && 'predictions' in image)) && (
                        <div className="mt-6">
                            <h4 className="text-lg font-semibold mb-4 text-gray-800">Morphological Analysis</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(image.predictions).filter(([key]) => key !== 'bean_type').map(([key, value]) => (
                                    <div key={key} className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-sm font-medium text-gray-600 capitalize">
                                            {key.replace(/_/g, ' ')}
                                        </span>
                                        {editMode && type === 'admin' ? (
                                            <input
                                                type="number"
                                                step="0.0001"
                                                value={editedData.predictions?.[key] || value}
                                                onChange={(e) => {
                                                    const newValue = parseFloat(e.target.value) || 0;
                                                    setEditedData((prev: any) => ({
                                                        ...prev,
                                                        predictions: {
                                                            ...prev.predictions,
                                                            [key]: newValue
                                                        }
                                                    }));
                                                }}
                                                className="w-full mt-1 border border-gray-300 rounded px-2 py-1 text-sm"
                                            />
                                        ) : (
                                            <p className="text-lg font-semibold text-gray-900">
                                                {typeof value === 'number' ? value.toFixed(4) : value}
                                                {key.includes('area') ? ' px²' : key.includes('length') || key.includes('perimeter') || key.includes('diameter') ? ' px' : ''}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                        {editMode && type === 'admin' && (
                            <>
                                <button
                                    onClick={() => {
                                        setEditMode(false);
                                        setEditedData(image);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </>
                        )}

                        {((type === 'submitted' || type === 'admin') && onDelete && 'id' in image) && (
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                        Delete Image
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {onDelete && (
                        <p className="text-xs text-gray-500 mt-2">
                            This action cannot be undone. The image will be permanently removed from the database.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageDetailsModal;
