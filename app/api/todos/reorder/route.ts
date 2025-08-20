import { TodoService } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    await TodoService.initializeDatabase();
    
    const body = await request.json();
    const { todoOrders } = body;

    if (!Array.isArray(todoOrders)) {
      return NextResponse.json(
        { error: 'todoOrders must be an array' },
        { status: 400 }
      );
    }

    // Validate the structure
    for (const item of todoOrders) {
      if (!item.id || typeof item.order !== 'number') {
        return NextResponse.json(
          { error: 'Each item must have id (string) and order (number)' },
          { status: 400 }
        );
      }
    }

    await TodoService.reorderTodos(todoOrders);

    return NextResponse.json({ success: true, message: 'Todos reordered successfully' });
  } catch (error) {
    console.error('Error reordering todos:', error);
    return NextResponse.json(
      { error: 'Failed to reorder todos' },
      { status: 500 }
    );
  }
}
