import { TodoSessionService, UpdateTodoSessionInput } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await TodoSessionService.getTodoSessionById(params.id);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Todo session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching todo session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todo session' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const input: UpdateTodoSessionInput = {
      ...(body.title && { title: body.title }),
      ...(body.content && { content: body.content }),
    };

    const session = await TodoSessionService.updateTodoSession(params.id, input);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Todo session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error updating todo session:', error);
    return NextResponse.json(
      { error: 'Failed to update todo session' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await TodoSessionService.deleteTodoSession(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Todo session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting todo session:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo session' },
      { status: 500 }
    );
  }
}
