import { NextResponse } from 'next/server';

const LARAVEL_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      eventType,
      location,
      date,
      guests,
      message,
      locale,
    } = body;

    // Validate essential fields
    if (!firstName || !lastName || !phone || !email || !date || !location) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields' },
        { status: 400 }
      );
    }

    // Forward to Laravel Backend API which uses Filament Email Templates and logs to DB
    const backendRes = await fetch(`${LARAVEL_API_BASE}/event-booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const backendData = await backendRes.json().catch(() => null);

    if (backendRes.ok && backendData?.success) {
      return NextResponse.json({
        success: true,
        booking_id: backendData.booking_id,
        message: backendData.message || 'Event booking inquiry successfully submitted',
      });
    }

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: backendData?.message || 'Failed to submit booking inquiry to server',
          errors: backendData?.errors,
        },
        { status: backendRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event booking inquiry successfully submitted',
    });
  } catch (error) {
    console.error('Error in event booking API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing booking request' },
      { status: 500 }
    );
  }
}
