import type {
  AdminPredictedImage,
  BeanImage,
  FarmFolder,
  PaginationData,
} from "@/interfaces/global";

export interface UploadImageRequest {
  user_id: string;
  image?: File;
  images?: File[];
}

export interface UploadImageResponse {
  success?: boolean; // Made optional since prediction endpoint doesn't return this
  message?: string;
  data?: any;
  images?: string[];
  features?: any;
  processed_image?: string;
}

// Temporary farm folders for researchers
const tempFarmFolders: FarmFolder[] = [
  {
    id: "own",
    name: "Own",
    ownerId: "researcher1",
    ownerName: "Current User",
    hasAccess: true,
    isLocked: false,
    imageCount: 25,
    validatedCount: 18,
    type: "own",
  },
  {
    id: "farm1",
    name: "Sunrise Coffee Farm",
    ownerId: "farmer1",
    ownerName: "John Smith",
    hasAccess: true,
    isLocked: false,
    imageCount: 45,
    validatedCount: 32,
    type: "farm",
  },
  {
    id: "farm2",
    name: "Mountain View Plantation",
    ownerId: "farmer2",
    ownerName: "Maria Garcia",
    hasAccess: false,
    isLocked: true,
    imageCount: 67,
    validatedCount: 45,
    type: "farm",
  },
  {
    id: "farm3",
    name: "Highland Coffee Estate",
    ownerId: "farmer3",
    ownerName: "Ahmed Hassan",
    hasAccess: false,
    isLocked: true,
    imageCount: 38,
    validatedCount: 28,
    type: "farm",
  },
];

// Temporary admin image data
const tempAdminImages: AdminPredictedImage[] = [
  {
    id: "120",
    src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
    userId: "12",
    userName: "Yajie Batumbakal",
    userRole: "researcher",
    locationId: "farm2",
    locationName: "Kenya Coffee Farm",
    submissionDate: "2024-01-15",
    validated: "verified",
    allegedVariety: "Arabica Premium",
    predictions: {
      area: 1520.5,
      perimeter: 125.3,
      major_axis_length: 45.2,
      minor_axis_length: 32.1,
      extent: 0.75,
      eccentricity: 0.68,
      convex_area: 1530.2,
      solidity: 0.95,
      mean_intensity: 128.5,
      equivalent_diameter: 43.7,
      bean_type: "Arabica",
    },
  },
  {
    id: "121",
    src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
    userId: "12",
    userName: "Yajie Batumbakal",
    userRole: "researcher",
    locationId: "farm2",
    locationName: "Kenya Coffee Farm",
    submissionDate: "2024-01-15",
    validated: "verified",
    allegedVariety: "Arabica Classic",
    predictions: {
      area: 1520.5,
      perimeter: 125.3,
      major_axis_length: 45.2,
      minor_axis_length: 32.1,
      extent: 0.75,
      eccentricity: 0.68,
      convex_area: 1530.2,
      solidity: 0.95,
      mean_intensity: 128.5,
      equivalent_diameter: 43.7,
      bean_type: "Arabica",
    },
  },
  {
    id: "122",
    src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
    userId: "12",
    userName: "Yajie Batumbakal",
    userRole: "researcher",
    locationId: "farm2",
    locationName: "Kenya Coffee Farm",
    submissionDate: "2024-01-15",
    validated: "verified",
    predictions: {
      area: 1520.5,
      perimeter: 125.3,
      major_axis_length: 45.2,
      minor_axis_length: 32.1,
      extent: 0.75,
      eccentricity: 0.68,
      convex_area: 1530.2,
      solidity: 0.95,
      mean_intensity: 128.5,
      equivalent_diameter: 43.7,
      bean_type: "Arabica",
    },
  },
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
    userId: "1",
    userName: "John Smith",
    userRole: "farmer",
    locationId: "farm1",
    locationName: "Kenya Coffee Farm",
    submissionDate: "2024-01-15",
    validated: "verified",
    allegedVariety: "Liberica Premium",
    predictions: {
      area: 1520.5,
      perimeter: 125.3,
      major_axis_length: 45.2,
      minor_axis_length: 32.1,
      extent: 0.75,
      eccentricity: 0.68,
      convex_area: 1530.2,
      solidity: 0.95,
      mean_intensity: 128.5,
      equivalent_diameter: 43.7,
      bean_type: "Arabica",
    },
  },
  {
    id: "2",
    src: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
    userId: "2",
    userName: "Maria Mercedes ang pangalan ko kaya ko nang magbanat ng buto",
    userRole: "farmer",
    locationId: "farm2",
    locationName: "Brazil Plantation",
    submissionDate: "2024-01-16",
    validated: "pending",
    predictions: {
      area: 1480.2,
      perimeter: 120.8,
      major_axis_length: 42.8,
      minor_axis_length: 30.5,
      extent: 0.72,
      eccentricity: 0.65,
      convex_area: 1495.1,
      solidity: 0.93,
      mean_intensity: 125.2,
      equivalent_diameter: 41.3,
      bean_type: "Robusta",
    },
  },
  {
    id: "3",
    src: "https://images.unsplash.com/photo-1610632380989-680fe40816c6?w=400",
    userId: "2",
    userName: "Dr.Quack Quack",
    userRole: "researcher",
    locationId: "farm3",
    locationName: "Ethiopia Highlands",
    submissionDate: "2024-01-17",
    validated: "verified",
    allegedVariety: "Ethiopian Heirloom",
    predictions: {
      area: 1620.8,
      perimeter: 130.2,
      major_axis_length: 48.1,
      minor_axis_length: 34.2,
      extent: 0.78,
      eccentricity: 0.71,
      convex_area: 1635.5,
      solidity: 0.97,
      mean_intensity: 132.1,
      equivalent_diameter: 45.8,
      bean_type: "Arabica",
    },
  },
  {
    id: "4",
    src: "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?w=400",
    userId: "3",
    userName: "Sara Di Binati",
    userRole: "farmer",
    locationId: "farm4",
    locationName: "Colombian Highlands",
    submissionDate: "2024-01-18",
    validated: "pending",
    predictions: {
      area: 1380.5,
      perimeter: 115.6,
      major_axis_length: 39.8,
      minor_axis_length: 28.5,
      extent: 0.69,
      eccentricity: 0.62,
      convex_area: 1395.2,
      solidity: 0.91,
      mean_intensity: 122.8,
      equivalent_diameter: 38.9,
      bean_type: "Liberica",
    },
  },
  {
    id: "5",
    src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
    userId: "4",
    userName: "Carlos Fetizananahuhulog ang luob",
    userRole: "farmer",
    locationId: "farm1",
    locationName: "Kenya Coffee Farm",
    submissionDate: "2024-01-19",
    validated: "verified",
    allegedVariety: "Robusta Supreme",
    predictions: {
      area: 1555.3,
      perimeter: 127.8,
      major_axis_length: 46.5,
      minor_axis_length: 33.1,
      extent: 0.76,
      eccentricity: 0.69,
      convex_area: 1568.9,
      solidity: 0.96,
      mean_intensity: 130.2,
      equivalent_diameter: 44.3,
      bean_type: "Arabica",
    },
  },
  {
    id: "6",
    src: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
    userId: "5",
    userName: "Bernadette De Momaccita",
    userRole: "researcher",
    locationId: "farm5",
    locationName: "Uganda Cooperative",
    submissionDate: "2024-01-20",
    validated: "pending",
    predictions: {
      area: 1420.7,
      perimeter: 118.4,
      major_axis_length: 41.2,
      minor_axis_length: 29.8,
      extent: 0.71,
      eccentricity: 0.64,
      convex_area: 1438.1,
      solidity: 0.92,
      mean_intensity: 124.6,
      equivalent_diameter: 40.1,
      bean_type: "Robusta",
    },
  },
];

// Temporary bean images for researcher annotations
const tempBeanImages: BeanImage[] = tempAdminImages.map((img) => ({
  ...img,
  is_validated: img.validated === "verified",
}));

class StorageService {
  private baseURL = `${import.meta.env.VITE_HOST_BE}/api/beans`;

  async uploadImage(data: UploadImageRequest): Promise<UploadImageResponse> {
    try {
      const formData = new FormData();
      formData.append("user_id", data.user_id);

      if (data.image) {
        formData.append("image", data.image);
      }

      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append("images", image);
        });
      }

      const response = await fetch(`${this.baseURL}/upload/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to upload image(s)");
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Failed to upload image(s)");
    }
  }

  async predictImage(data: UploadImageRequest): Promise<UploadImageResponse> {
    try {
      const formData = new FormData();
      formData.append("user_id", data.user_id);

      if (data.image) {
        formData.append("image", data.image);
      }

      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append("images", image);
        });
      }

      const response = await fetch(`${this.baseURL}/process/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to predict image(s)");
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Failed to predict image(s)");
    }
  }

  async submitImage(data: UploadImageRequest): Promise<UploadImageResponse> {
    try {
      const formData = new FormData();
      formData.append("user_id", data.user_id);

      if (data.image) {
        formData.append("image", data.image);
      }

      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append("images", image);
        });
      }

      const response = await fetch(`${this.baseURL}/upload/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to submit image(s)");
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Failed to submit image(s)");
    }
  }

  // Bean Image Management Methods for Researcher Annotations
  async getFarmFolders(researcherId: string): Promise<FarmFolder[]> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/researcher/farm-folders/${researcherId}/`);
      // return await response.json();

      await new Promise((resolve) => setTimeout(resolve, 100));
      return tempFarmFolders;
    } catch (error) {
      console.error("Error fetching farm folders:", error);
      throw error;
    }
  }

  async getBeanImagesByFarm(
    farmId: string,
    researcherId: string,
    validated?: boolean,
    page: number = 1,
    limit: number = 20
  ): Promise<{ images: BeanImage[]; pagination: PaginationData }> {
    try {
      // TODO: Replace with actual API call
      // const params = new URLSearchParams();
      // if (validated !== undefined) params.append('validated', validated.toString());
      // params.append('page', page.toString());
      // params.append('limit', limit.toString());
      // const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/researcher/farm-images/${farmId}?${params}`);
      // return await response.json();

      await new Promise((resolve) => setTimeout(resolve, 100));

      let filteredImages = [...tempBeanImages];

      // Filter by farm or researcher's own images
      if (farmId === "own") {
        filteredImages = filteredImages.filter(
          (img) => img.userId === researcherId
        );
      } else {
        filteredImages = filteredImages.filter(
          (img) => img.locationId === farmId
        );
      }

      // Filter by validation status if specified
      if (validated !== undefined) {
        filteredImages = filteredImages.filter(
          (img) => img.is_validated === validated
        );
      }

      // Apply pagination
      const totalItems = filteredImages.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedImages = filteredImages.slice(startIndex, endIndex);

      return {
        images: paginatedImages,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      console.error("Error fetching bean images by farm:", error);
      throw error;
    }
  }

  async annotateBeanImage(
    imageId: string,
    annotations: {
      allegedVariety?: string;
      validated: boolean;
      notes?: string;
    }
  ): Promise<BeanImage> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/researcher/annotate/${imageId}/`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(annotations)
      // });
      // return await response.json();

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Update in temp data
      const imageIndex = tempBeanImages.findIndex((img) => img.id === imageId);
      if (imageIndex !== -1) {
        tempBeanImages[imageIndex] = {
          ...tempBeanImages[imageIndex],
          ...annotations,
        };

        // Also update in admin images
        const adminImageIndex = tempAdminImages.findIndex(
          (img) => img.id === imageId
        );
        if (adminImageIndex !== -1) {
          tempAdminImages[adminImageIndex] = {
            ...tempAdminImages[adminImageIndex],
            validated: annotations.validated ? "verified" : "pending",
            allegedVariety: annotations.allegedVariety,
          };
        }

        return tempBeanImages[imageIndex];
      }

      throw new Error("Image not found");
    } catch (error) {
      console.error("Error annotating bean image:", error);
      throw error;
    }
  }

  async getUserImages(
    userId: string,
    userRole: "farmer" | "researcher",
    validated?: boolean
  ): Promise<BeanImage[]> {
    try {
      const response = await fetch(`${this.baseURL}/get-list/${userId}/`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to retrieve images");
      }

      const data = await response.json();
      // If validated filter is provided, filter the results
      if (validated) {
        console.log(data.images);
        return data.images.filter(
          (img: BeanImage) => img.is_validated === validated
        );
      }else {
        console.log(data.images);
        return data.images.filter(
          (img: BeanImage) => img.is_validated === false
        );
      }
    } catch (error: any) {
      throw new Error(error.message || "Failed to retrieve images");
    }
  }
}

export const storageService = new StorageService();
