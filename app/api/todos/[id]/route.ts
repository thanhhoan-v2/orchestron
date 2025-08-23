import { TodoStringService, UpdateTodoStringInput } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input: UpdateTodoStringInput = {
      content: body.content,
    };

    if (input.content === undefined) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const todoString = await TodoStringService.updateTodoString(id, input);
    
    if (!todoString) {
      return NextResponse.json(
        { error: 'Todo string not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(todoString);
  } catch (error) {
    console.error('Error updating todo string:', error);
    return NextResponse.json(
      { error: 'Failed to update todo string' },
      { status: 500 }
    );
  }
}
