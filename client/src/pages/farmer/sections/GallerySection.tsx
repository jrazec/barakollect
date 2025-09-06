import GalleryComponent from '@/components/GalleryComponent';
import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AdminService } from '@/services/adminService';
import type { BeanImage } from '@/interfaces/global';

interface GallerySectionProps {
    activeTab: string;
}

const GallerySection: React.FC<GallerySectionProps> = ({ activeTab }) => {
    const [images, setImages] = React.useState<BeanImage[]>([]);
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
        const fetchImages = async () => {
            if (!userId) return;
            
            setIsLoading(true);
            try {
                // Determine validation status based on active tab
                const isValidated = activeTab === 'Validated';
                
                // Fetch user's images with validation filter
                const userImages = await AdminService.getUserImages(userId, 'farmer', isValidated);
                
                setImages(userImages);
            } catch (error) {
                console.error('Error fetching images:', error);
                setImages([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchImages();
    }, [activeTab, userId]);

    // Convert BeanImage to format expected by GalleryComponent
    const convertedImages = images.map(img => ({
        id: img.id,
        src: img.src,
        bean_type: img.predictions.bean_type,
        is_validated: img.validated,
        location: img.locationName,
        predictions: img.predictions,
        userName: img.userName,
        userRole: img.userRole,
        submissionDate: img.submissionDate,
        allegedVariety: img.allegedVariety
    }));

    return (
        <GalleryComponent 
            type='submitted' 
            images={convertedImages}
            isLoading={isLoading}
        />
    );
};

export default GallerySection;