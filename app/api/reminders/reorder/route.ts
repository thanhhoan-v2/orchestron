import { ReminderService } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reminderOrders }: { reminderOrders: { id: string; order: number }[] } = body;

    if (!reminderOrders || !Array.isArray(reminderOrders)) {
      return NextResponse.json(
        { error: "reminderOrders array is required" },
        { status: 400 }
      );
    }

    // Validate each reminder order item
    for (const item of reminderOrders) {
      if (!item.id || typeof item.order !== 'number') {
        return NextResponse.json(
          { error: "Each reminder order must have id (string) and order (number)" },
          { status: 400 }
        );
      }
    }

    await ReminderService.reorderReminders(reminderOrders);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering reminders:", error);
    return NextResponse.json(
      { error: "Failed to reorder reminders" },
      { status: 500 }
    );
  }
}
