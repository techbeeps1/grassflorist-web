import { NextResponse } from 'next/server';

const LARAVEL_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function GET() {
  try {
    const res = await fetch(`${LARAVEL_API_BASE}/navigation`, {
      headers: {
        Accept: 'application/json',
      },
      // Short cache or revalidate
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch navigation: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/navigation proxy:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch navigation' }, { status: 500 });
  }
}
