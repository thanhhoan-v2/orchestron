import { CreateTodoSessionInput, TodoSessionService } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Ensure the database table exists
    await TodoSessionService.initializeDatabase();
    const sessions = await TodoSessionService.getAllTodoSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching todo sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todo sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure the database table exists
    await TodoSessionService.initializeDatabase();
    
    const body = await request.json();
    const input: CreateTodoSessionInput = {
      title: body.title || 'Untitled Session',
      content: body.content || '',
    };

    const session = await TodoSessionService.createTodoSession(input);
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating todo session:', error);
    return NextResponse.json(
      { error: 'Failed to create todo session' },
      { status: 500 }
    );
  }
}
