// types/form-return.ts
export interface FormReturnData {
  id: number; // ✅ เปลี่ยนจาก string เป็น number
  firstName: string;
  lastName: string;
  organizationName: string;
  addressLine1: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
  type: string;
  phoneNumber: string;
  numberOfSigners: number;
  image1?: string | null;
  image2?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
export interface FormReturnCreateData extends Omit<FormReturnData, 'id' | 'createdAt' | 'updatedAt'> {
  image1File?: File;
  image2File?: File;
}

export interface FormStep {
  step: number;
  title: string;
  isValid: boolean;
}

export interface RegionData {
  district: string;
  amphoe: string;
  province: string;
  zipcode: number | string;
  district_code: number | false;
  amphoe_code: number | false;
  province_code: number;
  type: string;
}

// ✅ เพิ่ม interface สำหรับ API Response
export interface FormReturnResponse {
  success: boolean;
  data?: FormReturnData;
  error?: string;
}

// ✅ เพิ่ม interface สำหรับ validation
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}