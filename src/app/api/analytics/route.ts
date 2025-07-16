import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const metric = await req.json();
    // Here we could forward to an analytics service, database, etc.
    console.log('Web Vitals Metric:', metric);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e?.toString() }, { status: 400 });
  }
}
