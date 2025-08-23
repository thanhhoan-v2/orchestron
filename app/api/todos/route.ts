import { CreateTodoStringInput, TodoStringService } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Ensure the database table exists
    await TodoStringService.initializeDatabase();
    const todoString = await TodoStringService.getTodoString();
    return NextResponse.json(todoString);
  } catch (error) {
    console.error('Error fetching todo string:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todo string' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure the database table exists
    await TodoStringService.initializeDatabase();
    
    const body = await request.json();
    const input: CreateTodoStringInput = {
      content: body.content || '',
    };

    const todoString = await TodoStringService.createOrUpdateTodoString(input);
    return NextResponse.json(todoString, { status: 201 });
  } catch (error) {
    console.error('Error creating or updating todo string:', error);
    return NextResponse.json(
      { error: 'Failed to create or update todo string' },
      { status: 500 }
    );
  }
}
