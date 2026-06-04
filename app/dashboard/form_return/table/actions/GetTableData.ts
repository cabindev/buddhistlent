'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type TableDataResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Interface for Form Return data
interface FormReturnItem {
  id: number;
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
  createdAt: Date;
}

interface FilterOptions {
  provinces: string[];
  organizationNames: string[];
  types: string[];
  districts: string[];
  amphoes: string[];
  years: number[];
}

interface TableStats {
  totalRecords: number;
  totalProvinces: number;
  totalOrganizations: number;
  recentSubmissions: number;
  totalSigners: number;
  avgSignersPerForm: number;
}

// 📋 Get all Form Return data for table
export async function getAllFormReturnTableData(): Promise<TableDataResult<FormReturnItem[]>> {
  try {
    const formReturnData = await prisma.form_return.findMany({
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
        createdAt: true,
      },
      orderBy: {
        organizationName: 'asc',
      },
    });

    return {
      success: true,
      data: formReturnData,
    };

  } catch (error) {
    console.error('Error fetching form return table data:', error);
    return {
      success: false,
      error: 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
    };
  } finally {
    await prisma.$disconnect();
  }
}

// 🎛️ Get filter options for dropdowns
export async function getFormReturnFilterOptions(): Promise<TableDataResult<FilterOptions>> {
  try {
    const [
      provinces,
      organizationNames,
      types,
      districts,
      amphoes,
      yearData,
    ] = await Promise.all([
      prisma.form_return.groupBy({
        by: ['province'],
        where: {
          province: {
            not: "",
          },
        },
        orderBy: {
          province: 'asc',
        },
      }),
      prisma.form_return.groupBy({
        by: ['organizationName'],
        where: {
          organizationName: {
            not: "",
          },
        },
        orderBy: {
          organizationName: 'asc',
        },
      }),
      prisma.form_return.groupBy({
        by: ['type'],
        where: {
          type: {
            not: "",
          },
        },
        orderBy: {
          type: 'asc',
        },
      }),
      prisma.form_return.groupBy({
        by: ['district'],
        where: {
          district: {
            not: "",
          },
        },
        orderBy: {
          district: 'asc',
        },
      }),
      prisma.form_return.groupBy({
        by: ['amphoe'],
        where: {
          amphoe: {
            not: "",
          },
        },
        orderBy: {
          amphoe: 'asc',
        },
      }),
      // ดึงข้อมูลปีทั้งหมดที่มี
      prisma.$queryRaw<Array<{year: bigint}>>`
        SELECT DISTINCT YEAR(createdAt) as year 
        FROM Form_return 
        WHERE createdAt IS NOT NULL 
        ORDER BY year DESC
      `,
    ]);

    const filterOptions: FilterOptions = {
      provinces: provinces.map(p => p.province).filter(Boolean),
      organizationNames: organizationNames.map(o => o.organizationName).filter(Boolean),
      types: types.map(t => t.type).filter(Boolean),
      districts: districts.map(d => d.district).filter(Boolean),
      amphoes: amphoes.map(a => a.amphoe).filter(Boolean),
      years: yearData.map(y => Number(y.year)).filter(Boolean),
    };

    return {
      success: true,
      data: filterOptions,
    };

  } catch (error) {
    console.error('Error fetching filter options:', error);
    return {
      success: false,
      error: 'ไม่สามารถโหลดตัวเลือกกรองได้',
    };
  } finally {
    await prisma.$disconnect();
  }
}

// 📊 Get table statistics
export async function getFormReturnTableStats(): Promise<TableDataResult<TableStats>> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalRecords,
      totalProvinces,
      totalOrganizations,
      recentSubmissions,
      totalSignersResult,
    ] = await Promise.all([
      // Total records
      prisma.form_return.count(),

      // Total unique provinces
      prisma.form_return.groupBy({
        by: ['province'],
        where: {
          province: {
            not: "",
          },
        },
      }).then(results => results.length),

      // Total unique organizations
      prisma.form_return.groupBy({
        by: ['organizationName'],
        where: {
          organizationName: {
            not: "",
          },
        },
      }).then(results => results.length),

      // Recent submissions (last 7 days)
      prisma.form_return.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),

      // Total signers
      prisma.form_return.aggregate({
        _sum: {
          numberOfSigners: true,
        },
      }),
    ]);

    const totalSigners = totalSignersResult._sum.numberOfSigners || 0;
    const avgSignersPerForm = totalRecords > 0 ? totalSigners / totalRecords : 0;

    const stats: TableStats = {
      totalRecords,
      totalProvinces,
      totalOrganizations,
      recentSubmissions,
      totalSigners,
      avgSignersPerForm: Math.round(avgSignersPerForm * 100) / 100,
    };

    return {
      success: true,
      data: stats,
    };

  } catch (error) {
    console.error('Error fetching table stats:', error);
    return {
      success: false,
      error: 'ไม่สามารถโหลดสถิติได้',
    };
  } finally {
    await prisma.$disconnect();
  }
}

// 🔍 Search functionality (if needed for advanced search)
export async function searchFormReturnData(
  searchTerm: string,
  filters: {
    province?: string;
    organizationName?: string;
    type?: string;
    district?: string;
    amphoe?: string;
  } = {}
): Promise<TableDataResult<FormReturnItem[]>> {
  try {
    const where: any = {
      AND: [
        // Text search
        searchTerm ? {
          OR: [
            {
              firstName: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              organizationName: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          ],
        } : {},
        
        // Filters
        filters.province ? { province: filters.province } : {},
        filters.organizationName ? { organizationName: filters.organizationName } : {},
        filters.type ? { type: filters.type } : {},
        filters.district ? { district: filters.district } : {},
        filters.amphoe ? { amphoe: filters.amphoe } : {},
      ].filter(condition => Object.keys(condition).length > 0),
    };

    const formReturnData = await prisma.form_return.findMany({
      where,
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
        createdAt: true,
      },
      orderBy: {
        organizationName: 'asc',
      },
    });

    return {
      success: true,
      data: formReturnData,
    };

  } catch (error) {
    console.error('Error searching form return data:', error);
    return {
      success: false,
      error: 'ไม่สามารถค้นหาข้อมูลได้',
    };
  } finally {
    await prisma.$disconnect();
  }
}

// 🎛️ Get filter options for specific year only
export async function getFormReturnFilterOptionsByYear(year: number): Promise<TableDataResult<FilterOptions>> {
  try {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const [
      provinces,
      organizationNames,
      types,
      districts,
      amphoes,
    ] = await Promise.all([
      prisma.form_return.groupBy({
        by: ['province'],
        where: {
          province: {
            not: "",
          },
          createdAt: {
            gte: startOfYear,
            lt: endOfYear,
          },
        },
        orderBy: {
          province: 'asc',
        },
      }),
      prisma.form_return.groupBy({
        by: ['organizationName'],
        where: {
          organizationName: {
            not: "",
          },
          createdAt: {
            gte: startOfYear,
            lt: endOfYear,
          },
        },
        orderBy: {
          organizationName: 'asc',
        },
      }),
      prisma.form_return.groupBy({
        by: ['type'],
        where: {
          type: {
            not: "",
          },
          createdAt: {
            gte: startOfYear,
            lt: endOfYear,
          },
        },
        orderBy: {
          type: 'asc',
        },
      }),
      prisma.form_return.groupBy({
        by: ['district'],
        where: {
          district: {
            not: "",
          },
          createdAt: {
            gte: startOfYear,
            lt: endOfYear,
          },
        },
        orderBy: {
          district: 'asc',
        },
      }),
      prisma.form_return.groupBy({
        by: ['amphoe'],
        where: {
          amphoe: {
            not: "",
          },
          createdAt: {
            gte: startOfYear,
            lt: endOfYear,
          },
        },
        orderBy: {
          amphoe: 'asc',
        },
      }),
    ]);

    const filterOptions: FilterOptions = {
      provinces: provinces.map(p => p.province).filter(Boolean),
      organizationNames: organizationNames.map(o => o.organizationName).filter(Boolean),
      types: types.map(t => t.type).filter(Boolean),
      districts: districts.map(d => d.district).filter(Boolean),
      amphoes: amphoes.map(a => a.amphoe).filter(Boolean),
      years: [year], // Only the specific year requested
    };

    return {
      success: true,
      data: filterOptions,
    };

  } catch (error) {
    console.error('Error fetching filter options for year:', error);
    return {
      success: false,
      error: 'ไม่สามารถโหลดตัวเลือกกรองสำหรับปีนี้ได้',
    };
  } finally {
    await prisma.$disconnect();
  }
}

// 🏢 Get form return data filtered by specific organization category
export async function getFormReturnByOrganization(organizationCategoryId: number): Promise<TableDataResult<FormReturnItem[]>> {
  try {
    // ขั้นตอน 1: หา Organization ทั้งหมดที่เชื่อมกับ organizationCategoryId นี้
    const organizations = await prisma.organization.findMany({
      where: {
        organizationCategoryId: organizationCategoryId,
      },
      select: {
        addressLine1: true, // ชื่อองค์กรจริง
      },
    });

    if (organizations.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // ขั้นตอน 2: เอา organizationName (addressLine1) มาหา form_return ที่เกี่ยวข้อง
    const organizationNames = organizations.map(org => org.addressLine1).filter(Boolean);

    const formReturnData = await prisma.form_return.findMany({
      where: {
        organizationName: {
          in: organizationNames,
        },
      },
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
        createdAt: true,
      },
      orderBy: {
        organizationName: 'asc',
      },
    });

    return {
      success: true,
      data: formReturnData,
    };

  } catch (error) {
    console.error('Error fetching form return data by organization:', error);
    return {
      success: false,
      error: 'ไม่สามารถโหลดข้อมูลองค์กรได้',
    };
  } finally {
    await prisma.$disconnect();
  }
}