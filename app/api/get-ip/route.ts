import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from '@/lib/device-parser';

export async function GET(request: NextRequest) {
  const ip = getClientIP(request.headers);
  
  return NextResponse.json({ ip });
}
