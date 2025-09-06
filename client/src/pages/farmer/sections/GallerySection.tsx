import GalleryComponent from '@/components/GalleryComponent';
import React from 'react';
import logo2 from "@/assets/images/logo.svg";
import { storageService } from '@/services/storageService';
import { supabase } from '@/lib/supabaseClient';
interface GallerySectionProps {
    activeTab: string;
}
// temporary placeholder images


const GallerySection: React.FC<GallerySectionProps> = ({ activeTab }) => {
    const [images, setImages] = React.useState<string[]>([]);
    const [userId, setUserId] = React.useState<string | null>(null);

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
            
            try {
                const response = await storageService.retrieveImages(userId);
                console.log('Fetched images:', response?.images);
                setImages(response?.images || []);

            } catch (error) {
                console.error('Error fetching images:', error);
            }
        };

        fetchImages();
    }, [activeTab, userId]);

    if (activeTab === 'Predicted Images') {
        return (
            <GalleryComponent type='predicted' images={[]} />

        );
    }

    if (activeTab === 'Submitted Images') {
        return (
            <GalleryComponent type='submitted' images={images} />
        );
    }

    return null;
};

export default GallerySection;