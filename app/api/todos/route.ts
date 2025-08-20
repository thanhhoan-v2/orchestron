import { CreateTodoInput, TodoService } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Ensure the database table exists
    await TodoService.initializeDatabase();
    const todos = await TodoService.getAllTodos();
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure the database table exists
    await TodoService.initializeDatabase();
    
    const body = await request.json();
    const input: CreateTodoInput = {
      title: body.title,
      description: body.description,
    };

    if (!input.title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const todo = await TodoService.createTodo(input);
    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}
