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

type ImageDetailsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    image: PredictedImage | SubmittedImage;
    type: 'predicted' | 'submitted';
    onDelete?: (id: string) => void;
};

const ImageDetailsModal: React.FC<ImageDetailsModalProps> = ({
    isOpen,
    onClose,
    image,
    type,
    onDelete
}) => {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen) return null;

    const handleDelete = async () => {
        if (type === 'submitted' && onDelete && 'id' in image) {
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {type === 'predicted' ? 'Coffee Bean Prediction Results' : 'Submitted Image Details'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Image */}
                    <div className="mb-6">
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

                    {/* Predicted Image Details */}
                    {type === 'predicted' && 'predictions' in image && (
                        <div>
                            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                                <h3 className="text-xl font-bold text-green-800 mb-2">
                                    Identified Bean Type: {image.predictions.bean_type}
                                </h3>
                                <p className="text-sm text-green-600">
                                    AI-powered analysis completed with high confidence
                                </p>
                            </div>

                            <h4 className="text-lg font-semibold mb-4 text-gray-800">Morphological Analysis</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-sm font-medium text-gray-600">Area</span>
                                        <p className="text-lg font-semibold text-gray-900">{image.predictions.area.toFixed(2)} px²</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-sm font-medium text-gray-600">Perimeter</span>
                                        <p className="text-lg font-semibold text-gray-900">{image.predictions.perimeter.toFixed(2)} px</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-sm font-medium text-gray-600">Major Axis Length</span>
                                        <p className="text-lg font-semibold text-gray-900">{image.predictions.major_axis_length.toFixed(2)} px</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-sm font-medium text-gray-600">Minor Axis Length</span>
                                        <p className="text-lg font-semibold text-gray-900">{image.predictions.minor_axis_length.toFixed(2)} px</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-sm font-medium text-gray-600">Equivalent Diameter</span>
                                        <p className="text-lg font-semibold text-gray-900">{image.predictions.equivalent_diameter.toFixed(2)} px</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-sm font-medium text-gray-600">Extent</span>
                                        <p className="text-lg font-semibold text-gray-900">{image.predictions.extent.toFixed(4)}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-sm font-medium text-gray-600">Eccentricity</span>
                                        <p className="text-lg font-semibold text-gray-900">{image.predictions.eccentricity.toFixed(4)}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-sm font-medium text-gray-600">Convex Area</span>
                                        <p className="text-lg font-semibold text-gray-900">{image.predictions.convex_area.toFixed(2)} px²</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-sm font-medium text-gray-600">Solidity</span>
                                        <p className="text-lg font-semibold text-gray-900">{image.predictions.solidity.toFixed(4)}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-sm font-medium text-gray-600">Mean Intensity</span>
                                        <p className="text-lg font-semibold text-gray-900">{image.predictions.mean_intensity.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submitted Image Details */}
                    {type === 'submitted' && 'bean_type' in image && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Submission Information</h3>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <span className="text-sm font-medium text-gray-600">Bean Type</span>
                                    <p className="text-xl font-bold text-gray-900">{image.bean_type}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <span className="text-sm font-medium text-gray-600">Validation Status</span>
                                    <div className="flex items-center mt-1">
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                            image.is_validated 
                                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                        }`}>
                                            {image.is_validated ? '✓ Validated' : '⏳ Pending Validation'}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <span className="text-sm font-medium text-gray-600">Collection Location</span>
                                    <p className="text-lg font-semibold text-gray-900">{image.location}</p>
                                </div>
                            </div>

                            {/* Delete Button */}
                            {onDelete && (
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                                    <p className="text-xs text-gray-500 mt-2">
                                        This action cannot be undone. The image will be permanently removed from the database.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageDetailsModal;
