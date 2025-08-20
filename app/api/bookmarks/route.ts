import { BookmarkService, CreateBookmarkInput } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const bookmarks = await BookmarkService.getAllBookmarks();
    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: CreateBookmarkInput = {
      title: body.title,
      url: body.url,
      description: body.description,
      parent_id: body.parent_id,
      icon: body.icon,
      color: body.color,
    };

    if (!input.title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const bookmark = await BookmarkService.createBookmark(input);
    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 }
    );
  }
}
