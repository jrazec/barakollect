import type { AdminPredictedImage, PaginationData, BeanDetection } from '@/interfaces/global';

export interface AnnotationImage extends AdminPredictedImage {
  totalBeans: number;
  validatedBeans: number;
  validationProgress: number;
  is_fully_validated: boolean;
  location: string;
  predictions: BeanDetection[];
}

export interface AnnotationResponse {
  images: AnnotationImage[];
  pagination: PaginationData;
}

export const AnnotationService = {
  async getAnnotations(page: number = 1, limit: number = 100): Promise<AnnotationResponse> {
    const response = await fetch(
      `${import.meta.env.VITE_HOST_BE}/api/beans/get-annotations/?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch annotations');
    }

    return response.json();
  },

  async validateBean(beanData: {
    bean_id: number;
    bean_type: string;
    features: any;
    extracted_feature_id?: number;
    prediction_id?: number;
    is_validated: boolean;
    image_id: string;
    annotated_by: {
      id: string;
      name: string;
      role: string;
    };
  }) {
    const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/beans/validate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(beanData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to validate bean');
    }

    return response.json();
  },
};