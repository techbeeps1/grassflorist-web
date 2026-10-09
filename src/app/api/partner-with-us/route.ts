import { NextResponse } from 'next/server';

const LARAVEL_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Forward multipart form data to Laravel API
    const backendRes = await fetch(`${LARAVEL_API_BASE}/partner-with-us`, {
      method: 'POST',
      body: formData,
    });

    const data = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || 'Failed to submit partner application',
          errors: data?.errors,
        },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error forwarding partner application:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error submitting partner application' },
      { status: 500 }
    );
  }
}
