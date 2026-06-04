import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  try {
    let campaigns;
    let totalItems;

    if (userId && !isNaN(parseInt(userId))) {
      campaigns = await prisma.campaignBuddhistLent.findMany({
        where: { userId: parseInt(userId) },
        skip,
        take: limit,
      });

      totalItems = await prisma.campaignBuddhistLent.count({
        where: { userId: parseInt(userId) },
      });

      return NextResponse.json({ campaigns, totalItems, completed: campaigns.length > 0 });
    } else {
      campaigns = await prisma.campaignBuddhistLent.findMany({
        where: {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { addressLine1: { contains: search } },
            { district: { contains: search } },
            { amphoe: { contains: search } },
            { province: { contains: search } },
            { phone: { contains: search } },
            { job: { contains: search } },
            { alcoholConsumption: { contains: search } },
            { healthImpact: { contains: search } }
          ]
        },
        skip,
        take: limit,
      });

      totalItems = await prisma.campaignBuddhistLent.count({
        where: {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { addressLine1: { contains: search } },
            { district: { contains: search } },
            { amphoe: { contains: search } },
            { province: { contains: search } },
            { phone: { contains: search } },
            { job: { contains: search } },
            { alcoholConsumption: { contains: search } },
            { healthImpact: { contains: search } }
          ]
        }
      });

      return NextResponse.json({ campaigns, totalItems });
    }
  } catch (error) {
    console.error('Error in GET /api/campaign-buddhist-lent:', error);
    return NextResponse.json({ error: 'Failed to retrieve campaign status' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'gender', 'birthday', 'addressLine1', 'district', 'amphoe', 'province', 'zipcode', 'job', 'alcoholConsumption', 'healthImpact', 'userId'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Convert and validate data types
    const userId = parseInt(formData.userId);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }

    const birthday = new Date(formData.birthday);
    if (isNaN(birthday.getTime())) {
      return NextResponse.json({ error: 'Invalid birthday format' }, { status: 400 });
    }

    let monthlyExpense = null;
    if (formData.monthlyExpense) {
      monthlyExpense = parseInt(formData.monthlyExpense);
      if (isNaN(monthlyExpense)) {
        return NextResponse.json({ error: 'Invalid monthlyExpense' }, { status: 400 });
      }
    }

    const newCampaign = await prisma.campaignBuddhistLent.create({
      data: {
        userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        birthday,
        addressLine1: formData.addressLine1,
        district: formData.district,
        amphoe: formData.amphoe,
        province: formData.province,
        zipcode: formData.zipcode,
        type: formData.type || null,
        phone: formData.phone || null,
        job: formData.job,
        alcoholConsumption: formData.alcoholConsumption,
        drinkingFrequency: formData.drinkingFrequency || null,
        intentPeriod: formData.intentPeriod || null,
        monthlyExpense,
        motivations: JSON.stringify(formData.motivations),
        healthImpact: formData.healthImpact
      },
    });

    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/campaign-buddhist-lent:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}