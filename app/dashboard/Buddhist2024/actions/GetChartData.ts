// app/dashboard/Buddhist2024/actions/GetChartData.ts
'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface DashboardSummary2024Data {
  totalParticipants: number;
  totalProvinces: number;
  totalGroupCategories: number;
  avgAge: number;
}

export async function getDashboardSummary2024(): Promise<{ success: boolean; data?: DashboardSummary2024Data }> {
  try {
    const year2024Start = new Date('2024-01-01T00:00:00.000Z');
    const year2024End = new Date('2025-01-01T00:00:00.000Z');

    const [
      totalParticipants,
      uniqueProvinces,
      uniqueGroupCategories,
      ageData
    ] = await Promise.all([
      // Total participants in 2024
      prisma.campaignBuddhistLent.count({
        where: {
          createdAt: { gte: year2024Start, lt: year2024End }
        }
      }),
      
      // Unique provinces in 2024
      prisma.campaignBuddhistLent.findMany({
        where: {
          createdAt: { gte: year2024Start, lt: year2024End }
        },
        select: { province: true },
        distinct: ['province']
      }),
      
      // Unique types in 2024
      prisma.campaignBuddhistLent.findMany({
        where: {
          createdAt: { gte: year2024Start, lt: year2024End },
          type: { not: null }
        },
        select: { type: true },
        distinct: ['type']
      }),
      
      // Age data for average calculation
      prisma.campaignBuddhistLent.findMany({
        where: {
          createdAt: { gte: year2024Start, lt: year2024End }
        },
        select: { birthday: true }
      })
    ]);

    // Calculate average age from birthday
    const currentDate = new Date();
    const validAges = ageData
      .filter(item => item.birthday !== null)
      .map(item => {
        const birthDate = new Date(item.birthday!);
        const age = currentDate.getFullYear() - birthDate.getFullYear();
        const monthDiff = currentDate.getMonth() - birthDate.getMonth();
        return (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) ? age - 1 : age;
      });
    const avgAge = validAges.length > 0 
      ? Math.round(validAges.reduce((sum, age) => sum + age, 0) / validAges.length)
      : 0;

    return {
      success: true,
      data: {
        totalParticipants,
        totalProvinces: uniqueProvinces.length,
        totalGroupCategories: uniqueGroupCategories.length,
        avgAge
      }
    };

  } catch (error) {
    console.error('Error fetching dashboard summary 2024:', error);
    return { success: false };
  } finally {
    await prisma.$disconnect();
  }
}

// Top 10 Provinces Chart Data
export async function getTop10ProvincesChartData2024() {
  try {
    const year2024Start = new Date('2024-01-01T00:00:00.000Z');
    const year2024End = new Date('2025-01-01T00:00:00.000Z');

    const provinceData = await prisma.campaignBuddhistLent.groupBy({
      by: ['province'],
      where: {
        createdAt: { gte: year2024Start, lt: year2024End }
      },
      _count: true,
      orderBy: {
        _count: {
          province: 'desc'
        }
      },
      take: 10
    });

    return {
      success: true,
      data: provinceData.map(item => ({
        name: item.province,
        value: item._count
      }))
    };
  } catch (error) {
    console.error('Error fetching top 10 provinces chart data 2024:', error);
    return { success: false, data: [] };
  } finally {
    await prisma.$disconnect();
  }
}

// Gender Chart Data
export async function getGenderChartData2024() {
  try {
    const year2024Start = new Date('2024-01-01T00:00:00.000Z');
    const year2024End = new Date('2025-01-01T00:00:00.000Z');

    const genderData = await prisma.campaignBuddhistLent.groupBy({
      by: ['gender'],
      where: {
        createdAt: { gte: year2024Start, lt: year2024End }
      },
      _count: true,
      orderBy: {
        _count: {
          gender: 'desc'
        }
      }
    });

    return {
      success: true,
      data: genderData.map(item => ({
        name: item.gender,
        value: item._count
      }))
    };
  } catch (error) {
    console.error('Error fetching gender chart data 2024:', error);
    return { success: false, data: [] };
  } finally {
    await prisma.$disconnect();
  }
}

// Age Group Chart Data
export async function getAgeGroupChartData2024() {
  try {
    const year2024Start = new Date('2024-01-01T00:00:00.000Z');
    const year2024End = new Date('2025-01-01T00:00:00.000Z');

    const ageData = await prisma.campaignBuddhistLent.findMany({
      where: {
        createdAt: { gte: year2024Start, lt: year2024End }
      },
      select: { birthday: true }
    });

    // Group ages into ranges
    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56-65': 0,
      '65+': 0
    };

    const currentDate = new Date();
    ageData.forEach(item => {
      const birthDate = new Date(item.birthday!);
      const age = currentDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = currentDate.getMonth() - birthDate.getMonth();
      const actualAge = (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) ? age - 1 : age;
      
      if (actualAge <= 25) ageGroups['18-25']++;
      else if (actualAge <= 35) ageGroups['26-35']++;
      else if (actualAge <= 45) ageGroups['36-45']++;
      else if (actualAge <= 55) ageGroups['46-55']++;
      else if (actualAge <= 65) ageGroups['56-65']++;
      else ageGroups['65+']++;
    });

    return {
      success: true,
      data: Object.entries(ageGroups).map(([name, value]) => ({ name, value }))
    };
  } catch (error) {
    console.error('Error fetching age group chart data 2024:', error);
    return { success: false, data: [] };
  } finally {
    await prisma.$disconnect();
  }
}

// Region Chart Data
export async function getRegionChartData2024() {
  try {
    const year2024Start = new Date('2024-01-01T00:00:00.000Z');
    const year2024End = new Date('2025-01-01T00:00:00.000Z');

    const provinceData = await prisma.campaignBuddhistLent.groupBy({
      by: ['province'],
      where: {
        createdAt: { gte: year2024Start, lt: year2024End }
      },
      _count: true
    });

    // Map provinces to regions
    const regionMap: { [key: string]: string } = {
      // ภาคเหนือ
      'เชียงใหม่': 'ภาคเหนือ', 'เชียงราย': 'ภาคเหนือ', 'แม่ฮ่องสอน': 'ภาคเหนือ', 
      'ลำปาง': 'ภาคเหนือ', 'ลำพูน': 'ภาคเหนือ', 'น่าน': 'ภาคเหนือ', 
      'พะเยา': 'ภาคเหนือ', 'แพร่': 'ภาคเหนือ', 'อุตรดิตถ์': 'ภาคเหนือ',
      
      // ภาคอีสาน
      'กาฬสินธุ์': 'ภาคอีสาน', 'ขอนแก่น': 'ภาคอีสาน', 'เลย': 'ภาคอีสาน', 
      'หนองคาย': 'ภาคอีสาน', 'หนองบัวลำภู': 'ภาคอีสาน', 'อุดรธานี': 'ภาคอีสาน',
      'บุรีรัมย์': 'ภาคอีสาน', 'จัสสิน': 'ภาคอีสาน', 'มหาสารคาม': 'ภาคอีสาน',
      'มุกดาหาร': 'ภาคอีสาน', 'นครพนม': 'ภาคอีสาน', 'นครราชสีมา': 'ภาคอีสาน',
      'ร้อยเอ็ด': 'ภาคอีสาน', 'สกลนคร': 'ภาคอีสาน', 'สุรินทร์': 'ภาคอีสาน',
      'ศีสะเกษ': 'ภาคอีสาน', 'อุบลราชธานี': 'ภาคอีสาน', 'อำนาจเจริญ': 'ภาคอีสาน',
      
      // ภาคกลาง
      'กรุงเทพฯ': 'ภาคกลาง', 'กรุงเทพมหานคร': 'ภาคกลาง', 'นนทบุรี': 'ภาคกลาง',
      'ปทุมธานี': 'ภาคกลาง', 'พระนครศรีอยุธยา': 'ภาคกลาง', 'อ่างทอง': 'ภาคกลาง',
      'ลพบุรี': 'ภาคกลาง', 'สิงห์บุรี': 'ภาคกลาง', 'ชัยนาท': 'ภาคกลาง',
      'สระบุรี': 'ภาคกลาง', 'นครนายก': 'ภาคกลาง', 'ปราจีนบุรี': 'ภาคกลาง',
      'ฉะเชิงเทรา': 'ภาคกลาง', 'สมุทรปราการ': 'ภาคกลาง', 'สมุทรสาคร': 'ภาคกลาง',
      'สมุทรสงคราม': 'ภาคกลาง',
      
      // ภาคตะวันออก
      'ชลบุรี': 'ภาคตะวันออก', 'ระยอง': 'ภาคตะวันออก', 'จันทบุรี': 'ภาคตะวันออก',
      'ตราด': 'ภาคตะวันออก', 'สระแก้ว': 'ภาคตะวันออก',
      
      // ภาคตะวันตก
      'กาญจนบุรี': 'ภาคตะวันตก', 'ตาก': 'ภาคตะวันตก', 'พิษณุโลก': 'ภาคตะวันตก',
      'พิจิตร': 'ภาคตะวันตก', 'เพชรบูรณ์': 'ภาคตะวันตก', 'ราชบุรี': 'ภาคตะวันตก',
      'สุโขทัย': 'ภาคตะวันตก', 'เพชรบุรี': 'ภาคตะวันตก', 'ประจวบคีรีขันธ์': 'ภาคตะวันตก',
      'กำแพงเพชร': 'ภาคตะวันตก',
      
      // ภาคใต้
      'ชุมพร': 'ภาคใต้', 'กระบี่': 'ภาคใต้', 'นครศรีธรรมราช': 'ภาคใต้',
      'นราธิวาส': 'ภาคใต้', 'ปัตตานี': 'ภาคใต้', 'พังงา': 'ภาคใต้',
      'พัทลุง': 'ภาคใต้', 'ภูเก็ต': 'ภาคใต้', 'ยะลา': 'ภาคใต้',
      'ระนอง': 'ภาคใต้', 'สงขลา': 'ภาคใต้', 'สตูล': 'ภาคใต้',
      'สุราษฎร์ธานี': 'ภาคใต้', 'ตรัง': 'ภาคใต้'
    };

    const regionCounts: { [key: string]: number } = {};

    provinceData.forEach(item => {
      const region = regionMap[item.province] || 'ไม่ระบุ';
      regionCounts[region] = (regionCounts[region] || 0) + item._count;
    });

    return {
      success: true,
      data: Object.entries(regionCounts).map(([name, value]) => ({ name, value }))
    };
  } catch (error) {
    console.error('Error fetching region chart data 2024:', error);
    return { success: false, data: [] };
  } finally {
    await prisma.$disconnect();
  }
}

// Motivation Chart Data
export async function getMotivationChartData2024() {
  try {
    const year2024Start = new Date('2024-01-01T00:00:00.000Z');
    const year2024End = new Date('2025-01-01T00:00:00.000Z');

    const motivationData = await prisma.campaignBuddhistLent.findMany({
      where: {
        createdAt: { gte: year2024Start, lt: year2024End }
      },
      select: { motivations: true }
    });

    // Process JSON motivations data
    const motivationCounts: { [key: string]: number } = {};
    
    motivationData.forEach(item => {
      if (item.motivations && Array.isArray(item.motivations)) {
        item.motivations.forEach((motivation) => {
          if (typeof motivation === 'string') {
            motivationCounts[motivation] = (motivationCounts[motivation] || 0) + 1;
          }
        });
      }
    });

    // Sort by count and convert to chart format
    const chartData = Object.entries(motivationCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([name, value]) => ({ name, value }));

    return {
      success: true,
      data: chartData
    };
  } catch (error) {
    console.error('Error fetching motivation chart data 2024:', error);
    return { success: false, data: [] };
  } finally {
    await prisma.$disconnect();
  }
}