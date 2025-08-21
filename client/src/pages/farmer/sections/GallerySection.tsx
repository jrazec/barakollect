import GalleryComponent from '@/components/GalleryComponent';
import React from 'react';
import logo2 from "@/assets/images/logo.svg";
interface GallerySectionProps {
    activeTab: string;
}
// temporary placeholder images
const placeholderImages = [
    logo2,
    logo2,
    logo2,
    logo2,
    logo2,
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