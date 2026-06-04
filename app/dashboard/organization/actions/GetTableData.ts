// app/dashboard/organization/actions/GetTableData.ts
'use server';

import prisma from '@/app/lib/db';

type TableDataResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

interface OrganizationWithCategory {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  addressLine1: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
  type: string;
  numberOfSigners: number;
  image1: string;
  image2: string;
  image3: string | null;
  image4: string | null;
  image5: string | null;
  createdAt: Date;
  updatedAt: Date;
  organizationCategoryId: number | null;
  organizationCategory: {
    id: number;
    name: string;
    shortName: string | null;
  } | null;
}

interface OrganizationCategory {
  id: number;
  name: string;
  shortName: string | null;
}

// 📋 ข้อมูลทั้งหมดสำหรับ Table
export async function getAllOrganizationData(): Promise<TableDataResult<{
  organizations: OrganizationWithCategory[];
  organizationCategories: OrganizationCategory[];
}>> {
  try {
    const [organizationData, organizationCategories] = await Promise.all([
      prisma.organization.findMany({
        include: {
          organizationCategory: {
            select: {
              id: true,
              name: true,
              shortName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.organizationCategory.findMany({
        select: {
          id: true,
          name: true,
          shortName: true
        },
        where: {
          isActive: true
        },
        orderBy: {
          name: 'asc'
        }
      })
    ]);

    return {
      success: true,
      data: {
        organizations: organizationData,
        organizationCategories: organizationCategories
      }
    };
  } catch (error) {
    console.error('Error fetching organization data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch organization data'
    };
  }
}

// 🔍 ข้อมูลเฉพาะตาม ID
export async function getOrganizationById(id: number): Promise<TableDataResult<OrganizationWithCategory>> {
  try {
    const data = await prisma.organization.findUnique({
      where: { id },
      include: {
        organizationCategory: {
          select: {
            id: true,
            name: true,
            shortName: true
          }
        }
      }
    });

    if (!data) {
      return {
        success: false,
        error: 'Data not found'
      };
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error fetching organization by ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch organization data'
    };
  }
}

// 📊 ข้อมูลสถิติพื้นฐานสำหรับ Table
export async function getOrganizationTableStats(): Promise<TableDataResult<{
  totalRecords: number;
  totalProvinces: number;
  totalCategories: number;
  recentSubmissions: number;
  avgSignersPerOrganization: number;
  totalSigners: number;
  organizationsWithCompleteImages: number;
  organizationsWithIncompleteImages: number;
}>> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalRecords,
      provinceCount,
      categoryCount,
      recentSubmissions,
      signersData,
      imageData
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.groupBy({
        by: ['province'],
        _count: { province: true }
      }),
      prisma.organizationCategory.count({
        where: { isActive: true }
      }),
      prisma.organization.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      prisma.organization.findMany({
        select: {
          numberOfSigners: true
        },
        where: {
          numberOfSigners: {
            gt: 0
          }
        }
      }),
      prisma.organization.findMany({
        select: {
          image1: true,
          image2: true,
          image3: true,
          image4: true,
          image5: true
        }
      })
    ]);

    const signers = signersData.map(item => item.numberOfSigners).filter(s => s !== null) as number[];
    const totalSigners = signers.reduce((sum, count) => sum + count, 0);
    const avgSignersPerOrganization = signers.length > 0 
      ? Math.round(totalSigners / signers.length)
      : 0;

    // นับองค์กรที่มีรูปภาพครบ (อย่างน้อย 2 รูป)
    let organizationsWithCompleteImages = 0;
    let organizationsWithIncompleteImages = 0;

    imageData.forEach(org => {
      const images = [org.image1, org.image2, org.image3, org.image4, org.image5];
      const validImages = images.filter(img => img !== null && img !== '').length;
      
      if (validImages >= 2) {
        organizationsWithCompleteImages++;
      } else {
        organizationsWithIncompleteImages++;
      }
    });

    return {
      success: true,
      data: {
        totalRecords,
        totalProvinces: provinceCount.length,
        totalCategories: categoryCount,
        recentSubmissions,
        avgSignersPerOrganization,
        totalSigners,
        organizationsWithCompleteImages,
        organizationsWithIncompleteImages
      }
    };
  } catch (error) {
    console.error('Error fetching organization table stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch table stats'
    };
  }
}

// 🏷️ ข้อมูลสำหรับ Filter Options
export async function getOrganizationFilterOptions(): Promise<TableDataResult<{
  provinces: string[];
  types: string[];
  organizationCategories: Array<{ id: number; name: string; shortName: string | null }>;
}>> {
  try {
    const [data, organizationCategories] = await Promise.all([
      prisma.organization.findMany({
        select: {
          province: true,
          type: true
        }
      }),
      prisma.organizationCategory.findMany({
        select: {
          id: true,
          name: true,
          shortName: true
        },
        where: {
          isActive: true
        },
        orderBy: {
          name: 'asc'
        }
      })
    ]);

    const provinces = Array.from(new Set(
      data.map(item => item.province)
        .filter((value): value is string => value != null && value !== '')
    )).sort();

    const types = Array.from(new Set(
      data.map(item => item.type)
        .filter((value): value is string => value != null && value !== '')
    )).sort();

    return {
      success: true,
      data: {
        provinces,
        types,
        organizationCategories
      }
    };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch filter options'
    };
  }
}

// 🔍 ค้นหาข้อมูลด้วยคำค้นหา (Advanced Search)
export async function searchOrganizationData(searchParams: {
  searchTerm?: string;
  province?: string;
  type?: string;
  organizationCategoryId?: number;
  minSigners?: number;
  maxSigners?: number;
  hasCompleteImages?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}): Promise<TableDataResult<{
  data: OrganizationWithCategory[];
  totalCount: number;
  hasMore: boolean;
}>> {
  try {
    const {
      searchTerm,
      province,
      type,
      organizationCategoryId,
      minSigners,
      maxSigners,
      hasCompleteImages,
      dateFrom,
      dateTo,
      limit = 20,
      offset = 0
    } = searchParams;

    const whereConditions: any = {};

    if (searchTerm) {
      whereConditions.OR = [
        { firstName: { contains: searchTerm } },
        { lastName: { contains: searchTerm } },
        { phoneNumber: { contains: searchTerm } }
      ];
    }

    if (province) whereConditions.province = { contains: province };
    if (type) whereConditions.type = type;
    if (organizationCategoryId) whereConditions.organizationCategoryId = organizationCategoryId;

    if (minSigners !== undefined || maxSigners !== undefined) {
      whereConditions.numberOfSigners = {};
      if (minSigners !== undefined) whereConditions.numberOfSigners.gte = minSigners;
      if (maxSigners !== undefined) whereConditions.numberOfSigners.lte = maxSigners;
    }

    if (dateFrom || dateTo) {
      whereConditions.createdAt = {};
      if (dateFrom) whereConditions.createdAt.gte = dateFrom;
      if (dateTo) whereConditions.createdAt.lte = dateTo;
    }

    let data: OrganizationWithCategory[];
    let totalCount: number;

    if (hasCompleteImages !== undefined) {
      // ถ้าต้องการกรองตามความครบถ้วนของรูปภาพ ต้องดึงข้อมูลทั้งหมดมาก่อน
      const allData = await prisma.organization.findMany({
        where: whereConditions,
        include: {
          organizationCategory: {
            select: {
              id: true,
              name: true,
              shortName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // กรองตามความครบถ้วนของรูปภาพ
      const filteredByImages = allData.filter(org => {
        const images = [org.image1, org.image2, org.image3, org.image4, org.image5];
        const validImages = images.filter(img => img !== null && img !== '').length;
        const isComplete = validImages >= 2;
        return hasCompleteImages ? isComplete : !isComplete;
      });

      totalCount = filteredByImages.length;
      data = filteredByImages.slice(offset, offset + limit);
    } else {
      // ไม่ต้องกรองตามรูปภาพ
      const [dataResult, countResult] = await Promise.all([
        prisma.organization.findMany({
          where: whereConditions,
          include: {
            organizationCategory: {
              select: {
                id: true,
                name: true,
                shortName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: limit,
          skip: offset
        }),
        prisma.organization.count({
          where: whereConditions
        })
      ]);

      data = dataResult;
      totalCount = countResult;
    }

    const hasMore = offset + limit < totalCount;

    return {
      success: true,
      data: {
        data,
        totalCount,
        hasMore
      }
    };
  } catch (error) {
    console.error('Error searching organization data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search data'
    };
  }
}

// 📈 สถิติขั้นสูงสำหรับ Dashboard
export async function getOrganizationAdvancedStats(): Promise<TableDataResult<{
  submissionTrend: Array<{ date: string; count: number }>;
  topProvinces: Array<{ province: string; count: number }>;
  topCategories: Array<{ name: string; count: number }>;
  signersDistribution: Array<{ range: string; count: number }>;
  imageCompletionStats: Array<{ status: string; count: number; percentage: number }>;
  typeDistribution: Array<{ type: string; count: number; percentage: number }>;
}>> {
  try {
    const [allData, submissionData, organizationCategories] = await Promise.all([
      prisma.organization.findMany({
        select: {
          province: true,
          organizationCategoryId: true,
          numberOfSigners: true,
          type: true,
          image1: true,
          image2: true,
          image3: true,
          image4: true,
          image5: true,
          createdAt: true
        }
      }),
      prisma.organization.findMany({
        select: {
          createdAt: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),
      prisma.organizationCategory.findMany({
        select: {
          id: true,
          name: true
        },
        where: {
          isActive: true
        }
      })
    ]);

    // 1. Submission Trend (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const submissionTrend = last30Days.map(date => {
      const count = submissionData.filter(item => 
        item.createdAt.toISOString().split('T')[0] === date
      ).length;
      return { date, count };
    });

    // 2. Top 10 Provinces
    const provinceCount = allData.reduce<Record<string, number>>((acc, item) => {
      const province = item.province || 'Unknown';
      acc[province] = (acc[province] || 0) + 1;
      return acc;
    }, {});

    const topProvinces = Object.entries(provinceCount)
      .map(([province, count]) => ({ province, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 3. Top Categories
    const categoryCount = allData.reduce<Record<string, number>>((acc, item) => {
      const category = organizationCategories.find(c => c.id === item.organizationCategoryId);
      const categoryName = category?.name || 'Unknown';
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {});

    const topCategories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 4. Signers Distribution
    const signersDistribution = allData.reduce<Record<string, number>>((acc, item) => {
      if (!item.numberOfSigners) {
        acc['Unknown'] = (acc['Unknown'] || 0) + 1;
        return acc;
      }

      const signers = item.numberOfSigners;
      let range = 'Unknown';
      
      if (signers >= 1 && signers <= 5) range = '1-5 คน';
      else if (signers >= 6 && signers <= 10) range = '6-10 คน';
      else if (signers >= 11 && signers <= 20) range = '11-20 คน';
      else if (signers >= 21 && signers <= 50) range = '21-50 คน';
      else if (signers >= 51 && signers <= 100) range = '51-100 คน';
      else if (signers > 100) range = 'มากกว่า 100 คน';

      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {});

    const signersDistributionArray = Object.entries(signersDistribution)
      .map(([range, count]) => ({ range, count }));

    // 5. Image Completion Stats
    const imageStats = allData.reduce<Record<string, number>>((acc, item) => {
      const images = [item.image1, item.image2, item.image3, item.image4, item.image5];
      const validImages = images.filter(img => img !== null && img !== '').length;
      
      let status = 'Unknown';
      if (validImages < 2) status = 'ไม่ครบตามข้อกำหนด';
      else if (validImages === 2) status = 'ครบตามข้อกำหนด (2 รูป)';
      else if (validImages === 3) status = '3 รูป';
      else if (validImages === 4) status = '4 รูป';
      else if (validImages === 5) status = 'ครบทั้งหมด (5 รูป)';

      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const totalImages = allData.length;
    const imageCompletionStats = Object.entries(imageStats)
      .map(([status, count]) => ({
        status,
        count,
        percentage: totalImages > 0 ? Math.round((count / totalImages) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // 6. Type Distribution
    const typeMapping = {
      'PUBLIC': 'ภาครัฐ',
      'PRIVATE': 'เอกชน',
      'NGO': 'องค์กรพัฒนาเอกชน',
      'ACADEMIC': 'สถาบันการศึกษา'
    };

    const typeCount = allData.reduce<Record<string, number>>((acc, item) => {
      const type = typeMapping[item.type as keyof typeof typeMapping] || item.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const totalTypes = allData.length;
    const typeDistribution = Object.entries(typeCount)
      .map(([type, count]) => ({
        type,
        count,
        percentage: totalTypes > 0 ? Math.round((count / totalTypes) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    return {
      success: true,
      data: {
        submissionTrend,
        topProvinces,
        topCategories,
        signersDistribution: signersDistributionArray,
        imageCompletionStats,
        typeDistribution
      }
    };
  } catch (error) {
    console.error('Error fetching advanced stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch advanced stats'
    };
  }
}

// 📊 สรุปข้อมูลรายเดือน
export async function getOrganizationMonthlyReport(year: number = new Date().getFullYear()): Promise<TableDataResult<{
  monthlyData: Array<{
    month: number;
    monthName: string;
    submissions: number;
    totalSigners: number;
    avgSigners: number;
    topProvince: string;
    topCategory: string;
  }>;
  yearSummary: {
    totalSubmissions: number;
    totalSigners: number;
    avgMonthlySubmissions: number;
    peakMonth: string;
    topProvince: string;
    topCategory: string;
  };
}>> {
  try {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const [data, organizationCategories] = await Promise.all([
      prisma.organization.findMany({
        where: {
          createdAt: {
            gte: startOfYear,
            lte: endOfYear
          }
        },
        select: {
          createdAt: true,
          numberOfSigners: true,
          province: true,
          organizationCategoryId: true
        }
      }),
      prisma.organizationCategory.findMany({
        select: {
          id: true,
          name: true
        }
      })
    ]);

    const monthlyStats: { [key: number]: any } = {};
    
    for (let month = 0; month < 12; month++) {
      monthlyStats[month] = {
        month: month + 1,
        monthName: new Date(2024, month, 1).toLocaleDateString('th-TH', { month: 'long' }),
        submissions: 0,
        totalSigners: 0,
        signers: [],
        provinces: {},
        categories: {}
      };
    }

    data.forEach(item => {
      const month = item.createdAt.getMonth();
      const monthData = monthlyStats[month];
      
      monthData.submissions++;
      
      if (item.numberOfSigners) {
        monthData.totalSigners += item.numberOfSigners;
        monthData.signers.push(item.numberOfSigners);
      }
      
      if (item.province) {
        monthData.provinces[item.province] = (monthData.provinces[item.province] || 0) + 1;
      }
      
      if (item.organizationCategoryId) {
        const category = organizationCategories.find(c => c.id === item.organizationCategoryId);
        if (category) {
          monthData.categories[category.name] = (monthData.categories[category.name] || 0) + 1;
        }
      }
    });

    const monthlyData = Object.values(monthlyStats).map((month: any) => {
      const avgSigners = month.signers.length > 0 
        ? Math.round(month.totalSigners / month.signers.length) 
        : 0;
      
      const topProvince = Object.entries(month.provinces)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || '-';

      const topCategory = Object.entries(month.categories)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || '-';

      return {
        month: month.month,
        monthName: month.monthName,
        submissions: month.submissions,
        totalSigners: month.totalSigners,
        avgSigners,
        topProvince,
        topCategory
      };
    });

    const totalSubmissions = data.length;
    const totalSigners = data.reduce((sum, item) => sum + (item.numberOfSigners || 0), 0);
    const avgMonthlySubmissions = Math.round(totalSubmissions / 12);
    
    const peakMonthData = monthlyData.reduce((peak, current) => 
      current.submissions > peak.submissions ? current : peak
    );
    const peakMonth = peakMonthData.monthName;

    const provinceCount = data.reduce<Record<string, number>>((acc, item) => {
      const province = item.province || 'Unknown';
      acc[province] = (acc[province] || 0) + 1;
      return acc;
    }, {});

    const topProvince = Object.entries(provinceCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '-';

    const categoryCount = data.reduce<Record<string, number>>((acc, item) => {
      const category = organizationCategories.find(c => c.id === item.organizationCategoryId);
      const categoryName = category?.name || 'Unknown';
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {});

    const topCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '-';

    return {
      success: true,
      data: {
        monthlyData,
        yearSummary: {
          totalSubmissions,
          totalSigners,
          avgMonthlySubmissions,
          peakMonth,
          topProvince,
          topCategory
        }
      }
    };
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch monthly report'
    };
  }
}