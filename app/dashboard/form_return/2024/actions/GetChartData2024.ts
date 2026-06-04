// app/dashboard/form_return/2024/actions/GetChartData2024.ts
'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface FormReturn2024ChartData {
  stats: {
    totalForms: number;
    totalOrganizations: number;
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
  regionTypeData: Array<{
    region: string;
    province: string;
    type: string;
    count: number;
    percentage: number;
  }>;
  monthlyData: Array<{
    month: string;
    count: number;
  }>;
}

export async function getFormReturn2024ChartData(): Promise<FormReturn2024ChartData> {
  try {
    const year2024Start = new Date('2024-01-01T00:00:00.000Z');
    const year2024End = new Date('2025-01-01T00:00:00.000Z');

    // Get 2024 data
    const [
      totalForms,
      totalOrganizations,
      provinceStats,
      typeStats,
      regionTypeStats,
      monthlyStats
    ] = await Promise.all([
      // 2024 forms count
      prisma.form_return.count({
        where: {
          createdAt: { gte: year2024Start, lt: year2024End }
        }
      }),
      
      // 2024 unique organizations
      prisma.form_return.groupBy({
        by: ['organizationName'],
        where: {
          createdAt: { gte: year2024Start, lt: year2024End }
        },
        _count: true
      }).then(results => results.length),

      // Province distribution (2024)
      prisma.form_return.groupBy({
        by: ['province'],
        where: {
          createdAt: { gte: year2024Start, lt: year2024End }
        },
        _count: true,
        orderBy: {
          _count: {
            province: 'desc'
          }
        }
      }),

      // Type distribution (2024)
      prisma.form_return.groupBy({
        by: ['type'],
        where: {
          createdAt: { gte: year2024Start, lt: year2024End }
        },
        _count: true,
        orderBy: {
          _count: {
            type: 'desc'
          }
        }
      }),

      // Province and Type combined data (2024)
      prisma.form_return.groupBy({
        by: ['province', 'type'],
        where: {
          createdAt: { gte: year2024Start, lt: year2024End }
        },
        _count: true,
        orderBy: {
          _count: {
            province: 'desc'
          }
        }
      }),

      // Monthly data for 2024
      prisma.form_return.findMany({
        where: {
          createdAt: { gte: year2024Start, lt: year2024End }
        },
        select: {
          createdAt: true
        }
      })
    ]);

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

    // Process region-type combined data
    const regionTypeData = regionTypeStats.map(item => ({
      region: '', // Will be calculated by the component
      province: item.province,
      type: item.type,
      count: item._count,
      percentage: Math.round((item._count / totalForms) * 100 * 100) / 100
    }));

    // Process monthly data for 2024
    const monthlyMap = new Map<string, { count: number }>();
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    // Initialize all months with zero
    months.forEach(month => {
      monthlyMap.set(month, { count: 0 });
    });

    // Fill with actual data from 2024
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
        totalOrganizations: totalOrganizations || 0
      },
      provinceData,
      typeData,
      regionTypeData,
      monthlyData
    };

  } catch (error) {
    console.error('Error fetching form return 2024 chart data:', error);
    
    return {
      stats: {
        totalForms: 0,
        totalOrganizations: 0
      },
      provinceData: [],
      typeData: [],
      regionTypeData: [],
      monthlyData: []
    };
  } finally {
    await prisma.$disconnect();
  }
}