// app/dashboard/form_return/2025/actions/GetChartData2025.ts
'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface FormReturn2025ChartData {
  stats: {
    totalForms: number;
    totalOrganizations: number;
    monthlyGrowth: number;
  };
  provinceData: Array<{
    province: string;
    count: number;
    percentage: number;
  }>;
  typeData: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  organizationTypeData: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  monthlyData: Array<{
    month: string;
    count: number;
  }>;
}

export async function getFormReturn2025ChartData(): Promise<FormReturn2025ChartData> {
  try {
    const year2025Start = new Date('2025-01-01T00:00:00.000Z');
    const year2025End = new Date('2026-01-01T00:00:00.000Z');

    // Organization options for classification
    const organizationOptions = [
      'ข้าราชการ', 'ข้าราชการเกษียณ', 'ค้าขาย/งานบริการ', 'ธ.ก.ส', 
      'นักเรียน/นักศึกษา', 'บริษัท', 'ประกอบธุรกิจส่วนตัว', 'พนักงานบริษัท', 
      'รัฐวิสาหกิจ', 'รับจ้างทั่วไป', 'ลูกจ้างหน่วยราชการ', 'ว่างงาน', 
      'อ.ส.ม.', 'อาชีพอิสระ', 'อาชีพอื่นๆ', 'เกษตรกร', 'โรงงานอุตสาหกรรม', 'NGO'
    ];

    // Current month for growth calculation (2025)
    const now = new Date();
    const currentMonthStart = new Date(2025, now.getMonth(), 1);
    const previousMonthStart = new Date(2025, now.getMonth() - 1, 1);

    // Get 2025 data
    const [
      totalForms,
      currentMonthCount,
      previousMonthCount,
      totalOrganizations,
      provinceStats,
      typeStats,
      organizationStats,
      monthlyStats
    ] = await Promise.all([
      // 2025 forms count
      prisma.form_return.count({
        where: {
          createdAt: { gte: year2025Start, lt: year2025End }
        }
      }),
      
      // Current month 2025 count
      prisma.form_return.count({
        where: {
          createdAt: { gte: currentMonthStart }
        }
      }),
      
      // Previous month 2025 count
      prisma.form_return.count({
        where: {
          createdAt: { gte: previousMonthStart, lt: currentMonthStart }
        }
      }),

      // 2025 unique organizations
      prisma.form_return.groupBy({
        by: ['organizationName'],
        where: {
          createdAt: { gte: year2025Start, lt: year2025End }
        },
        _count: true
      }).then(results => results.length),

      // Province distribution (2025)
      prisma.form_return.groupBy({
        by: ['province'],
        where: {
          createdAt: { gte: year2025Start, lt: year2025End }
        },
        _count: true,
        orderBy: {
          _count: {
            province: 'desc'
          }
        }
      }),

      // Type distribution (2025)
      prisma.form_return.groupBy({
        by: ['type'],
        where: {
          createdAt: { gte: year2025Start, lt: year2025End }
        },
        _count: true,
        orderBy: {
          _count: {
            type: 'desc'
          }
        }
      }),

      // Organization name distribution (2025)
      prisma.form_return.findMany({
        where: {
          createdAt: { gte: year2025Start, lt: year2025End }
        },
        select: {
          organizationName: true
        }
      }),

      // Monthly data for 2025
      prisma.form_return.findMany({
        where: {
          createdAt: { gte: year2025Start, lt: year2025End }
        },
        select: {
          createdAt: true
        }
      })
    ]);

    // Calculate monthly growth percentage for 2025
    const monthlyGrowth = previousMonthCount > 0 
      ? ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100 
      : currentMonthCount > 0 ? 100 : 0;

    // Process province data
    const provinceData = provinceStats.map(item => ({
      province: item.province,
      count: item._count,
      percentage: Math.round((item._count / totalForms) * 100 * 100) / 100
    }));

    // Process type data
    const typeData = typeStats.map(item => ({
      type: item.type,
      count: item._count,
      percentage: Math.round((item._count / totalForms) * 100 * 100) / 100
    }));

    // Process organization type data
    const organizationTypeMap = new Map<string, number>();
    
    // Initialize predefined organization types
    organizationOptions.forEach(option => {
      organizationTypeMap.set(option, 0);
    });
    
    // Initialize "อื่นๆ" category
    organizationTypeMap.set('อื่นๆ', 0);
    
    // Count organization names and categorize them
    organizationStats.forEach(form => {
      const orgName = form.organizationName?.trim() || '';
      
      // Check if organization name matches any predefined option
      const matchedOption = organizationOptions.find(option => 
        orgName.toLowerCase().includes(option.toLowerCase()) || 
        option.toLowerCase().includes(orgName.toLowerCase())
      );
      
      if (matchedOption) {
        organizationTypeMap.set(matchedOption, (organizationTypeMap.get(matchedOption) || 0) + 1);
      } else if (orgName) {
        // Add to "อื่นๆ" category if not empty and doesn't match predefined options
        organizationTypeMap.set('อื่นๆ', (organizationTypeMap.get('อื่นๆ') || 0) + 1);
      }
    });
    
    // Convert to array and filter out zero counts
    const organizationTypeData = Array.from(organizationTypeMap.entries())
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / totalForms) * 100 * 100) / 100
      }))
      .sort((a, b) => b.count - a.count);

    // Process monthly data for 2025
    const monthlyMap = new Map<string, { count: number }>();
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    // Initialize all months with zero
    months.forEach(month => {
      monthlyMap.set(month, { count: 0 });
    });

    // Fill with actual data from 2025
    monthlyStats.forEach(form => {
      const month = months[form.createdAt.getMonth()];
      const current = monthlyMap.get(month) || { count: 0 };
      monthlyMap.set(month, {
        count: current.count + 1
      });
    });

    const monthlyData = months.map(month => ({
      month,
      ...monthlyMap.get(month)!
    }));

    return {
      stats: {
        totalForms: totalForms || 0,
        totalOrganizations: totalOrganizations || 0,
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100
      },
      provinceData,
      typeData,
      organizationTypeData,
      monthlyData
    };

  } catch (error) {
    console.error('Error fetching form return 2025 chart data:', error);
    
    return {
      stats: {
        totalForms: 0,
        totalOrganizations: 0,
        monthlyGrowth: 0
      },
      provinceData: [],
      typeData: [],
      organizationTypeData: [],
      monthlyData: []
    };
  } finally {
    await prisma.$disconnect();
  }
}