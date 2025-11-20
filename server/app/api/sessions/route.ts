import { NextResponse } from 'next/server';
import { prisma } from '../../../prisma/client';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const macUser = url.searchParams.get('mac');

    const sessions = await prisma.session.findMany({
      where: { mac: macUser?.toString() },
      include: { sessionType: true },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json(sessions);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Error fetching sessions.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { sessionTypeId, startTime, duration, mac } = await request.json();

    if (!sessionTypeId || !startTime || !duration || !mac) {
      return NextResponse.json(
        { error: 'Incomplete fields.' },
        { status: 400 }
      );
    }

    const newSession = await prisma.session.create({
      data: {
        sessionTypeId,
        startTime: new Date(startTime),
        duration,
        mac,
      },
      include: { sessionType: true },
    });

    return NextResponse.json(newSession);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Error creating session.' },
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

    await prisma.session.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Error deleting session.' },
      { status: 500 }
    );
  }
}

// ------------------- Intelligent Suggestions -------------------

export async function POST_SUGGEST(request: Request) {
  try {
    const { sessionTypeId, duration, mac } = await request.json();

    if (!sessionTypeId || !duration || !mac) {
      return NextResponse.json(
        { error: 'Incomplete fields.' },
        { status: 400 }
      );
    }

    const availability = await prisma.availability.findMany();
    const sessions = await prisma.session.findMany({
      include: { sessionType: true },
    });

    const now = new Date();
    const suggestions: { dateTime: string }[] = [];

    // Search next 14 days
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const date = new Date(now);
      date.setDate(now.getDate() + dayOffset);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

      const dayWindows = availability.filter((a) => a.day === dayName);

      for (const window of dayWindows) {
        const [startHour, startMin] = window.startHour.split(':').map(Number);
        const [endHour, endMin] = window.endHour.split(':').map(Number);

        let slot = new Date(date);
        slot.setHours(startHour, startMin, 0, 0);

        const endTime = new Date(date);
        endTime.setHours(endHour, endMin, 0, 0);

        while (slot.getTime() + duration * 60000 <= endTime.getTime()) {
          const overlap = sessions.some((s) => {
            const sStart = new Date(s.startTime).getTime();
            const sEnd = sStart + s.duration * 60000;

            const slotStart = slot.getTime();
            const slotEnd = slotStart + duration * 60000;

            return slotStart < sEnd && slotEnd > sStart;
          });

          if (!overlap) {
            suggestions.push({ dateTime: slot.toISOString() });
          }

          // Increment by 30 minutes
          slot = new Date(slot.getTime() + 30 * 60000);
        }
      }
    }

    // Return up to 5 best suggestions
    return NextResponse.json(suggestions.slice(0, 5));
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Error generating suggestions.' },
      { status: 500 }
    );
  }
}

// Re-export POST with alternative route
export const POST_SUGGEST_ALIAS = POST_SUGGEST;
