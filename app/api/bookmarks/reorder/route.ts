import { BookmarkService } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookmarkOrders } = body;

    if (!Array.isArray(bookmarkOrders)) {
      return NextResponse.json(
        { error: 'bookmarkOrders must be an array' },
        { status: 400 }
      );
    }

    // Validate that each item has id and order
    for (const item of bookmarkOrders) {
      if (!item.id || typeof item.order !== 'number') {
        return NextResponse.json(
          { error: 'Each item must have id and order' },
          { status: 400 }
        );
      }
    }

    await BookmarkService.reorderBookmarks(bookmarkOrders);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to reorder bookmarks' },
      { status: 500 }
    );
  }
}
