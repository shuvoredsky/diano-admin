import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json(
    {
      success: true,
      statusCode: 200,
      message: 'DIANO Admin frontend is healthy',
      data: {
        status: 'UP',
        app: 'diano-admin',
        timezone: 'Asia/Dhaka',
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}

