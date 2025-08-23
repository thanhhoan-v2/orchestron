import { SavedMoneyService } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const savedMoney = await SavedMoneyService.getCurrentSavedMoney();
    
    if (!savedMoney) {
      return NextResponse.json({ amount: "0", quick_add_amounts: [] });
    }
    
    return NextResponse.json({ 
      amount: savedMoney.amount,
      quick_add_amounts: savedMoney.quick_add_amounts || []
    });
  } catch (error) {
    console.error("Error fetching saved money:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved money" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { amount, quick_add_amounts } = await request.json();
    
    if (!amount || typeof amount !== "string") {
      return NextResponse.json(
        { error: "Amount is required and must be a string" },
        { status: 400 }
      );
    }
    
    const input: { amount: string; quick_add_amounts?: string[] } = { amount };
    if (quick_add_amounts && Array.isArray(quick_add_amounts)) {
      input.quick_add_amounts = quick_add_amounts;
    }
    
    const updatedSavedMoney = await SavedMoneyService.updateSavedMoney(input);
    
    return NextResponse.json({ 
      amount: updatedSavedMoney.amount,
      quick_add_amounts: updatedSavedMoney.quick_add_amounts || []
    });
  } catch (error) {
    console.error("Error updating saved money:", error);
    return NextResponse.json(
      { error: "Failed to update saved money" },
      { status: 500 }
    );
  }
}
