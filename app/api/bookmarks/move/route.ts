import { BookmarkService } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceId, targetId, newParentId, insertIndex } = body;

    if (!sourceId) {
      return NextResponse.json(
        { error: 'sourceId is required' },
        { status: 400 }
      );
    }

    // If targetId is empty string, it means drop to root level
    const finalParentId = targetId === "" ? null : (newParentId || targetId);
    
    await BookmarkService.moveBookmark({
      sourceId,
      newParentId: finalParentId,
      insertIndex: insertIndex || 0
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error moving bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to move bookmark' },
      { status: 500 }
    );
  }
}
