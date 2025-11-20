import { NextResponse } from 'next/server';
import { prisma } from '../../../prisma/client';

export async function GET(request: Request) {
  try {

    const url = new URL(request.url);
    const macUser = url.searchParams.get('mac');

    const availability = await prisma.availability.findMany({
      orderBy: { day: 'asc' },
      where: { mac: macUser?.toString() },
    });

    return NextResponse.json(availability);

  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Error fetching availability' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { day, startHour, endHour, mac } = await request.json();

    if (day === undefined || !startHour || !endHour || !mac) {
      return NextResponse.json(
        { error: 'Please fill in day, start hour and end hour' }, 
        { status: 400 }
      );
    }

    const availability = await prisma.availability.create({
      data: {
        day,
        startHour: startHour, // new Date(startHour).toISOString(),
        endHour: endHour,       // new Date(endHour).toISOString(),
        mac,
      },
    });

    return NextResponse.json(availability);

  } catch (error) {
    console.error('Error creating availability:', error);
    return NextResponse.json(
      { error: 'Error creating availability' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    console.log(`id ${id}`);

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' }, 
        { status: 400 }
      );
    }

    await prisma.availability.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting availability:', error);
    return NextResponse.json(
      { error: 'Error deleting availability' }, 
      { status: 500 }
    );
  }
}
