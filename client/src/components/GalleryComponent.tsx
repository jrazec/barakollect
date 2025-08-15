import React from 'react';
import EmptyStateNotice from './EmptyStateNotice';

type GalleryComponentProps = {
    images: string[];
};

const GalleryComponent: React.FC<GalleryComponentProps> = ({ images }) => {
    return (
        <div className="w-full border border-gray-300 p-3 box-border bg-gray-50 max-h-[400px] overflow-y-auto">
            {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                    {images.map((src, idx) => (
                        <img
                            key={idx}
                            src={src}
                            alt={`Gallery item ${idx + 1}`}
                            className="w-full max-h-[180px] object-cover rounded-2xl shadow"
                        />
                    ))}
                </div>
            ) : (
                <EmptyStateNotice message="No images found." />
            )}
        </div>
    );
};

export default GalleryComponent;