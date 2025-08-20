import { BookmarkService } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const parentOptions = await BookmarkService.getParentOptions();
    return NextResponse.json(parentOptions);
  } catch (error) {
    console.error('Error fetching parent options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parent options' },
      { status: 500 }
    );
  }
}
