import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AdminService } from '@/services/adminService';
import type { BeanImage } from '@/interfaces/global';
import PageContainer from '../../components/PageContainer';
import PageHeader from '../../components/PageHeader';
import TabComponent from '@/components/TabComponent';
import GalleryComponent from '@/components/GalleryComponent';

const BeansGallery: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Validated');
  const [images, setImages] = useState<BeanImage[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchImages();
    }
  }, [activeTab, userId]);

  const fetchImages = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Determine validation status based on active tab
      const isValidated = activeTab === 'Validated';
      
      // Fetch researcher's own images with validation filter
      const userImages = await AdminService.getUserImages(userId, 'researcher', isValidated);
      
      setImages(userImages);
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

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
    <PageContainer>
      <div className="w-full max-w-6xl bg-[var(--mocha-beige)] rounded-xl shadow p-6">

        {/* Header */}
        <PageHeader
          title="Bean Gallery"
          subtitle="Review your submitted bean samples organized by validation status"
        />
        
        <TabComponent 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          tabs={['Validated', 'Not Yet Validated']} 
        />

        {/* Gallery Content */}
        <GalleryComponent 
          type='submitted' 
          images={convertedImages}
          isLoading={isLoading}
        />

      </div>
    </PageContainer>
  );
};

export default BeansGallery;
