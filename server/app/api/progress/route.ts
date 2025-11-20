import { NextResponse } from 'next/server';
import { prisma } from '../../../prisma/client';
import dayjs from "dayjs";


export async function GET() {
  try {
    const now = dayjs();

    const sessions = await prisma.session.findMany();

    const completed = sessions.filter(s =>
      dayjs(s.startTime).isBefore(now)
    ).length;

    const total = sessions.length;

    return NextResponse.json({
      totalSessions: total,
      completedSessions: completed
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}