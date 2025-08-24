import { CreateGoalInput, GoalService } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Ensure the database table exists
    await GoalService.initializeDatabase();
    const goals = await GoalService.getAllGoals();
    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure the database table exists
    await GoalService.initializeDatabase();
    
    const body = await request.json();
    const input: CreateGoalInput = {
      title: body.title,
      description: body.description,
      target_date: body.target_date,
      amount: body.amount,
      progress: body.progress,
      priority: body.priority,
    };

    if (!input.title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const goal = await GoalService.createGoal(input);
    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}
