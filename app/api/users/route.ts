import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            {
              AND: [
                { firstName: { contains: search.split(' ')[0], mode: 'insensitive' } },
                { lastName: { contains: search.split(' ')[1] || '', mode: 'insensitive' } },
              ],
            },
          ],
        }
      : {};

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ 
      users,
      totalItems: totalCount,
    });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, role } = await req.json();
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error in PATCH /api/users:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}
