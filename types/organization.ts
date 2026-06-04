// types/organization.ts
export interface OrganizationCategory {
  id: number;
  name: string;
  shortName?: string | null;
  description?: string | null;
  categoryType: string;
  isActive: boolean;
  sortOrder?: number | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    organizations: number;
  };
}

export interface OrganizationCategoryFormData {
  id?: number;
  name: string;
  shortName?: string;
  description?: string;
  categoryType: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreateOrganizationCategoryData {
  name: string;
  shortName?: string;
  description?: string;
  categoryType: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateOrganizationCategoryData {
  name?: string;
  shortName?: string;
  description?: string;
  categoryType?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface OrganizationCategoryFilters {
  search?: string;
  categoryType?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'categoryType' | 'createdAt' | 'updatedAt' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
}

export interface Organization {
  id: number;
  firstName: string;
  lastName: string;
  organizationCategoryId: number | null;
  organizationCategory: OrganizationCategory | null;
  addressLine1: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
  type: string;
  phoneNumber: string;
  numberOfSigners: number;
  image1: string;
  image2: string;
  image3?: string | null;
  image4?: string | null;
  image5?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to get unique category types from data
export const getCategoryTypesFromData = (categories: OrganizationCategory[]): { value: string; label: string }[] => {
  const uniqueTypes = Array.from(new Set(categories.map(cat => cat.categoryType)));
  return uniqueTypes.map(type => ({ value: type, label: type }));
};