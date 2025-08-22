import { FundService, UpdateFundInput } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Fund ID is required" },
        { status: 400 }
      );
    }

    const fund = await FundService.getFundById(id);
    
    if (!fund) {
      return NextResponse.json(
        { error: "Fund not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(fund);
  } catch (error) {
    console.error("Error fetching fund:", error);
    return NextResponse.json(
      { error: "Failed to fetch fund" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updates: UpdateFundInput = body;

    if (!id) {
      return NextResponse.json(
        { error: "Fund ID is required" },
        { status: 400 }
      );
    }

    // Validate updates
    if (updates.title !== undefined && !updates.title.trim()) {
      return NextResponse.json(
        { error: "Title cannot be empty" },
        { status: 400 }
      );
    }

    if (updates.price !== undefined) {
      if (typeof updates.price !== 'string' || !updates.price.trim()) {
        return NextResponse.json(
          { error: "Price is required" },
          { status: 400 }
        );
      }

      // Validate that price contains only numbers, commas, and periods
      if (!/^[\d,\.]+$/.test(updates.price.trim())) {
        return NextResponse.json(
          { error: "Price must contain only numbers, commas, and periods" },
          { status: 400 }
        );
      }
    }

    // Clean up title and price if provided
    if (updates.title) {
      updates.title = updates.title.trim();
    }
    if (updates.price) {
      updates.price = updates.price.trim();
    }

    const fund = await FundService.updateFund(id, updates);

    if (!fund) {
      return NextResponse.json(
        { error: "Fund not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(fund);
  } catch (error) {
    console.error("Error updating fund:", error);
    return NextResponse.json(
      { error: "Failed to update fund" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Fund ID is required" },
        { status: 400 }
      );
    }

    const success = await FundService.deleteFund(id);

    if (!success) {
      return NextResponse.json(
        { error: "Fund not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Fund deleted successfully" });
  } catch (error) {
    console.error("Error deleting fund:", error);
    return NextResponse.json(
      { error: "Failed to delete fund" },
      { status: 500 }
    );
  }
}
