// types/dashboard.ts
import { FormReturnData } from './form-return';

export interface DashboardPageProps {
  searchParams: {
    page?: string;
    search?: string;
    year?: string;
    limit?: string;
  };
}

export interface DashboardInitialData {
  forms: FormReturnData[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  currentYear: number;
  previousYear: number;
  twoYearsAgoYear: number;
  totalForms: number;
  totalSigners: number;
  currentYearCount: number;
  previousYearCount: number;
  twoYearsAgoCount: number;
  monthlyGrowth: number;
}

export interface DashboardStats {
  totalForms: number;
  totalSigners: number;
  currentYearCount: number;
  previousYearCount: number;
  monthlyGrowth: number;
  error?: string;
}

export interface DashboardFormsResult {
  forms: FormReturnData[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  error?: string;
}