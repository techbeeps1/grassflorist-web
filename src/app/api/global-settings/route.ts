import { NextResponse } from 'next/server';

const LARAVEL_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function GET() {
  try {
    const res = await fetch(`${LARAVEL_API_BASE}/global-settings`, {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch global settings: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/global-settings proxy:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch global settings' },
      { status: 500 }
    );
  }
}
