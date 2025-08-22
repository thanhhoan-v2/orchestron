import { GoalService } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { goalOrders } = body;

    if (!Array.isArray(goalOrders)) {
      return NextResponse.json(
        { error: 'goalOrders must be an array' },
        { status: 400 }
      );
    }

    await GoalService.reorderGoals(goalOrders);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering goals:', error);
    return NextResponse.json(
      { error: 'Failed to reorder goals' },
      { status: 500 }
    );
  }
}
