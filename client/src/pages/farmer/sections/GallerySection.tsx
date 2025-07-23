import GalleryComponent from '@/components/GalleryComponent';
import React from 'react';

interface GallerySectionProps {
    activeTab: string;
}
// temporary placeholder images
const placeholderImages = [
    'src/assets/images/logo.svg',
    'src/assets/images/logo.svg',
    'src/assets/images/logo.svg',
    'src/assets/images/logo.svg',
    'src/assets/images/logo.svg',
];

const GallerySection: React.FC<GallerySectionProps> = ({ activeTab }) => {
    if (activeTab === 'Predicted Images') {
        return (
            <GalleryComponent images={[]} />
           
        );
    }

    if (activeTab === 'Submitted Images') {
        return (
            <GalleryComponent images={placeholderImages} />
        );
    }

    return null;
};

export default GallerySection;