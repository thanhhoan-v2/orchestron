import { TodoService, UpdateTodoInput } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const todo = await TodoService.getTodoById(params.id);
    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todo' },
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
    const input: UpdateTodoInput = {
      title: body.title,
      description: body.description,
      completed: body.completed,
    };

    const todo = await TodoService.updateTodo(params.id, input);
    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(todo);
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('DELETE request for todo ID:', params.id);
    console.log('Database URL configured:', !!process.env.DATABASE_URL);
    
    // Ensure the database table exists
    await TodoService.initializeDatabase();
    console.log('Database initialization completed');
    
    const success = await TodoService.deleteTodo(params.id);
    console.log('Delete operation result:', success);
    
    if (!success) {
      console.log('Todo not found in database for ID:', params.id);
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }
    
    console.log('Returning success response');
    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to delete todo', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
