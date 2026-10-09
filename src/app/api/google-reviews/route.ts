import { NextResponse } from 'next/server';

const LARAVEL_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const qs = searchParams.toString();
    const endpoint = `${LARAVEL_API_BASE}/google-reviews${qs ? `?${qs}` : ''}`;

    const res = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch google reviews: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/google-reviews proxy:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch google reviews' },
      { status: 500 }
    );
  }
}
