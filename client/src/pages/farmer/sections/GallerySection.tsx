import GalleryComponent from '@/components/GalleryComponent';
import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AdminService } from '@/services/adminService';
import type { BeanImage } from '@/interfaces/global';
import {storageService} from '@/services/storageService';

interface GallerySectionProps {
    activeTab: string;
}

const GallerySection: React.FC<GallerySectionProps> = ({ activeTab }) => {
    const [allImages, setAllImages] = React.useState<BeanImage[]>([]);
    const [userId, setUserId] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);
        };
        getUser();
    }, []);

    React.useEffect(() => {
        const fetchAllImages = async () => {
            if (!userId) return;
            
            setIsLoading(true);
            try {
                // Fetch all user's images without validation filter
                const userImages = await storageService.getUserImages(userId, 'farmer');
                
                setAllImages(userImages);
                console.log(userImages);
            } catch (error) {
                console.error('Error fetching images:', error);
                setAllImages([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllImages();
    }, [userId]);

    // Filter images based on active tab
    const filteredImages = allImages.filter(img => {
        if (activeTab === 'Validated') {
            return img.is_validated === true;
        } else {
            return img.is_validated === false || img.is_validated === null;
        }
    });

    // Convert BeanImage to format expected by GalleryComponent (predicted type)
    const convertedImages = filteredImages.map(img => ({
        src: img.src,
        is_validated: img.is_validated,
        predictions: img.predictions
    }));

    return (
        <GalleryComponent 
            type='predicted' 
            images={convertedImages}
            isLoading={isLoading}
        />
    );
};

export default GallerySection;