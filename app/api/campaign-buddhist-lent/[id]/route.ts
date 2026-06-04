// app/api/campaign-buddhist-lent/[id]/route.ts
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// GET: ดึงข้อมูลตาม ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const campaign = await prisma.campaignBuddhistLent.findUnique({
      where: { id: Number(id) },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(campaign, { status: 200 });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: แก้ไขข้อมูลตาม ID
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    const {
      firstName,
      lastName,
      gender,
      birthday,
      addressLine1,
      district,
      amphoe,
      province,
      zipcode,
      type,
      phone,
      job,
      alcoholConsumption,
      drinkingFrequency,
      intentPeriod,
      monthlyExpense,
      motivations,
      healthImpact,
    } = data;

    const updatedCampaign = await prisma.campaignBuddhistLent.update({
      where: { id: Number(id) },
      data: {
        firstName,
        lastName,
        gender,
        birthday: new Date(birthday),
        addressLine1,
        district,
        amphoe,
        province,
        zipcode,
        type,
        phone,
        job,
        alcoholConsumption,
        drinkingFrequency,
        intentPeriod,
        monthlyExpense: monthlyExpense ? parseInt(monthlyExpense) : null,
        motivations,
        healthImpact,
      },
    });

    revalidatePath('/dashboard/soberCheers');

    return NextResponse.json(updatedCampaign, { status: 200 });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: ลบข้อมูลตาม ID
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const campaign = await prisma.campaignBuddhistLent.findUnique({
      where: { id: Number(id) },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const deletedCampaign = await prisma.campaignBuddhistLent.delete({
      where: { id: Number(id) },
    });

    revalidatePath('/dashboard/soberCheers');

    return NextResponse.json(deletedCampaign, { status: 200 });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
