import { FundService } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fundOrders }: { fundOrders: { id: string; order: number }[] } = body;

    if (!Array.isArray(fundOrders)) {
      return NextResponse.json(
        { error: "Fund orders must be an array" },
        { status: 400 }
      );
    }

    // Validate each order entry
    for (const entry of fundOrders) {
      if (!entry.id || typeof entry.order !== 'number') {
        return NextResponse.json(
          { error: "Each entry must have id (string) and order (number)" },
          { status: 400 }
        );
      }
    }

    await FundService.reorderFunds(fundOrders);

    return NextResponse.json({ message: "Funds reordered successfully" });
  } catch (error) {
    console.error("Error reordering funds:", error);
    return NextResponse.json(
      { error: "Failed to reorder funds" },
      { status: 500 }
    );
  }
}
