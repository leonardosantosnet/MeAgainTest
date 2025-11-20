import { NextResponse } from 'next/server';
import { prisma } from '../../../prisma/client';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const macUser = url.searchParams.get('mac');

    const sessionTypes = await prisma.sessionType.findMany({
      where: { mac: macUser?.toString() },
      include: {
        _count: {
          select: { sessions: true },
        },
      },
    });

    // Returns the count of completed sessions in the completedCount field
    const result = sessionTypes.map((st) => ({
      id: st.id,
      name: st.name,
      category: st.category,
      priority: st.priority,
      completedCount: st._count.sessions,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Error fetching session types.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, category, priority, mac } = await request.json();

    if (!name || !category || priority == null || !mac) {
      return NextResponse.json(
        { error: 'Incomplete fields.' },
        { status: 400 }
      );
    }

    const newType = await prisma.sessionType.create({
      data: { name, category, priority, mac },
    });

    return NextResponse.json(newType);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Error creating session type.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required.' },
        { status: 400 }
      );
    }

    await prisma.sessionType.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Error deleting session type.' },
      { status: 500 }
    );
  }
}
