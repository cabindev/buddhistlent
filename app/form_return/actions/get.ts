// app/form_return/actions/get.ts
'use server';

import { PrismaClient } from '@prisma/client';
import { FormReturnData } from '@/types/form-return';
import { revalidatePath } from 'next/cache';

// ปรับ Prisma Client สำหรับ production
const prisma = new PrismaClient({
 log: process.env.NODE_ENV === 'development' ? ['error'] : [],
 errorFormat: 'minimal',
});

// Connection pool management
let isConnected = false;

async function ensureConnection() {
 if (!isConnected) {
   try {
     await prisma.$connect();
     isConnected = true;
   } catch (error) {
     console.error('Database connection failed:', error);
     throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
   }
 }
}

// Graceful shutdown
if (typeof process !== 'undefined') {
 process.on('beforeExit', async () => {
   await prisma.$disconnect();
   isConnected = false;
 });
}

export async function getFormReturnById(id: number): Promise<{
 success: boolean;
 data?: FormReturnData;
 error?: string;
}> {
 try {
   await ensureConnection();

   const form = await prisma.form_return.findUnique({
     where: { id },
     select: {
       id: true,
       firstName: true,
       lastName: true,
       organizationName: true,
       addressLine1: true,
       district: true,
       amphoe: true,
       province: true,
       zipcode: true,
       type: true,
       phoneNumber: true,
       numberOfSigners: true,
       image1: true,
       image2: true,
       createdAt: true,
       updatedAt: true,
     }
   });

   if (!form) {
     return { success: false, error: 'ไม่พบข้อมูล' };
   }

   return { success: true, data: form as FormReturnData };
 } catch (error) {
   console.error('Error fetching form return:', error);
   return { 
     success: false, 
     error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล' 
   };
 }
}

export async function getFormReturns(params: {
 search?: string;
 page?: number;
 limit?: number;
 year?: number;
} = {}): Promise<{
 forms: FormReturnData[];
 totalItems: number;
 totalPages: number;
 currentPage: number;
 error?: string;
}> {
 const { 
   search = '', 
   page = 1, 
   limit = 20, 
   year 
 } = params;
 
 // Validate parameters
 const validatedPage = Math.max(1, page);
 const validatedLimit = Math.min(Math.max(1, limit), 100);
 const skip = (validatedPage - 1) * validatedLimit;

 try {
   await ensureConnection();

   // Build where condition
   const whereCondition: any = {};

   if (search.trim()) {
     whereCondition.OR = [
       { firstName: { contains: search.trim() } },
       { lastName: { contains: search.trim() } },
       { organizationName: { contains: search.trim() } },
       { phoneNumber: { contains: search.trim() } },
       { district: { contains: search.trim() } },
       { amphoe: { contains: search.trim() } },
       { province: { contains: search.trim() } },
     ];
   }

   if (year && year > 2000 && year < 3000) {
     const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
     const endOfYear = new Date(`${year + 1}-01-01T00:00:00.000Z`);
     
     whereCondition.createdAt = {
       gte: startOfYear,
       lt: endOfYear
     };
   }

   // Execute queries with timeout
   const queryPromise = prisma.$transaction([
     prisma.form_return.findMany({
       where: whereCondition,
       select: {
         id: true,
         firstName: true,
         lastName: true,
         organizationName: true,
         addressLine1: true,
         district: true,
         amphoe: true,
         province: true,
         zipcode: true,
         type: true,
         phoneNumber: true,
         numberOfSigners: true,
         image1: true,
         image2: true,
         createdAt: true,
         updatedAt: true,
       },
       orderBy: { createdAt: 'desc' },
       skip,
       take: validatedLimit,
     }),
     prisma.form_return.count({
       where: whereCondition,
     }),
   ]);

   const timeoutPromise = new Promise<never>((_, reject) => 
     setTimeout(() => reject(new Error('Query timeout')), 15000)
   );

   const [forms, totalItems] = await Promise.race([
     queryPromise,
     timeoutPromise
   ]);

   const totalPages = Math.ceil(totalItems / validatedLimit);

   return { 
     forms: forms as FormReturnData[], 
     totalItems, 
     totalPages,
     currentPage: validatedPage,
   };

 } catch (error) {
   console.error('Error fetching forms:', error);
   
   return { 
     forms: [], 
     totalItems: 0, 
     totalPages: 0,
     currentPage: validatedPage,
     error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล'
   };
 }
}

// Real-time version (ใช้เป็น alias ของ getFormReturns)
export async function getFormReturnsRealtime(searchParams: {
 search?: string;
 page?: number;
 limit?: number;
 year?: number;
}) {
 return getFormReturns(searchParams);
}

export async function getFormReturnStats(): Promise<{
 totalForms: number;
 totalSigners: number;
 currentYearCount: number;
 previousYearCount: number;
 monthlyGrowth: number;
 error?: string;
}> {
 try {
   await ensureConnection();

   // ใช้ปีปัจจุบันแทนการ hardcode
   const currentYear = new Date().getFullYear();
   const previousYear = currentYear - 1;
   
   const currentYearStart = new Date(`${currentYear}-01-01T00:00:00.000Z`);
   const currentYearEnd = new Date(`${currentYear + 1}-01-01T00:00:00.000Z`);
   const previousYearStart = new Date(`${previousYear}-01-01T00:00:00.000Z`);
   const previousYearEnd = new Date(`${previousYear + 1}-01-01T00:00:00.000Z`);

   // Current month for growth calculation
   const now = new Date();
   const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
   const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

   const queryPromise = prisma.$transaction([
     // Total forms
     prisma.form_return.count(),
     
     // Total signers
     prisma.form_return.aggregate({
       _sum: { numberOfSigners: true }
     }),
     
     // Current year count
     prisma.form_return.count({
       where: {
         createdAt: { gte: currentYearStart, lt: currentYearEnd }
       }
     }),
     
     // Previous year count
     prisma.form_return.count({
       where: {
         createdAt: { gte: previousYearStart, lt: previousYearEnd }
       }
     }),
     
     // Current month count
     prisma.form_return.count({
       where: {
         createdAt: { gte: currentMonthStart }
       }
     }),
     
     // Previous month count
     prisma.form_return.count({
       where: {
         createdAt: { gte: previousMonthStart, lt: currentMonthStart }
       }
     }),
   ]);

   const timeoutPromise = new Promise<never>((_, reject) => 
     setTimeout(() => reject(new Error('Stats query timeout')), 10000)
   );

   const [
     totalForms,
     totalSignersResult,
     currentYearCount,
     previousYearCount,
     currentMonthCount,
     previousMonthCount
   ] = await Promise.race([queryPromise, timeoutPromise]);

   // Calculate monthly growth percentage
   const monthlyGrowth = previousMonthCount > 0 
     ? ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100 
     : currentMonthCount > 0 ? 100 : 0;

   return {
     totalForms: totalForms || 0,
     totalSigners: totalSignersResult._sum.numberOfSigners || 0,
     currentYearCount: currentYearCount || 0,
     previousYearCount: previousYearCount || 0,
     monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
   };

 } catch (error) {
   console.error('Error fetching stats:', error);
   
   return {
     totalForms: 0,
     totalSigners: 0,
     currentYearCount: 0,
     previousYearCount: 0,
     monthlyGrowth: 0,
     error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล'
   };
 }
}

export async function checkPhoneNumberExists(
 phoneNumber: string, 
 excludeId?: number
): Promise<boolean> {
 try {
   await ensureConnection();

   if (!phoneNumber.trim()) return false;

   const form = await prisma.form_return.findFirst({
     where: {
       phoneNumber: phoneNumber.trim(),
       ...(excludeId && { NOT: { id: excludeId } })
     },
     select: { id: true }
   });

   return !!form;
 } catch (error) {
   console.error('Error checking phone number:', error);
   return false;
 }
}

// Server Action สำหรับ revalidate
export async function revalidateFormReturns() {
 try {
   revalidatePath('/form_return');
   revalidatePath('/dashboard/form_return');
   return { success: true };
 } catch (error) {
   console.error('Error revalidating:', error);
   return { success: false, error: 'Failed to revalidate' };
 }
}

// Search suggestions (แก้ไขแล้วสำหรับ MySQL)
export async function getSearchSuggestions(query: string): Promise<string[]> {
 try {
   if (!query.trim() || query.length < 2) return [];

   await ensureConnection();

   const suggestions = await prisma.form_return.findMany({
     where: {
       OR: [
         { organizationName: { contains: query.trim() } },
         { district: { contains: query.trim() } },
         { amphoe: { contains: query.trim() } },
         { province: { contains: query.trim() } },
       ]
     },
     select: {
       organizationName: true,
       district: true,
       amphoe: true,
       province: true,
     },
     take: 10,
     distinct: ['organizationName']
   });

   const uniqueSuggestions = new Set<string>();
   
   suggestions.forEach(item => {
     if (item.organizationName) uniqueSuggestions.add(item.organizationName);
     if (item.district) uniqueSuggestions.add(item.district);
     if (item.amphoe) uniqueSuggestions.add(item.amphoe);
     if (item.province) uniqueSuggestions.add(item.province);
   });

   return Array.from(uniqueSuggestions)
     .filter(suggestion => 
       suggestion.toLowerCase().includes(query.toLowerCase())
     )
     .slice(0, 5);

 } catch (error) {
   console.error('Error getting search suggestions:', error);
   return [];
 }
}

// เพิ่มฟังก์ชันสำหรับ export data
export async function getFormReturnsForExport(year?: number): Promise<FormReturnData[]> {
 try {
   await ensureConnection();

   const whereCondition: any = {};

   if (year && year > 2000 && year < 3000) {
     const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
     const endOfYear = new Date(`${year + 1}-01-01T00:00:00.000Z`);
     
     whereCondition.createdAt = {
       gte: startOfYear,
       lt: endOfYear
     };
   }

   const forms = await prisma.form_return.findMany({
     where: whereCondition,
     orderBy: { createdAt: 'desc' },
     // ไม่จำกัดจำนวนสำหรับ export
   });

   return forms as FormReturnData[];
 } catch (error) {
   console.error('Error fetching forms for export:', error);
   return [];
 }
}