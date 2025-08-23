import { SavedMoneyService } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const savedMoney = await SavedMoneyService.getCurrentSavedMoney();
    
    if (!savedMoney) {
      return NextResponse.json({ amount: "0" });
    }
    
    return NextResponse.json({ amount: savedMoney.amount });
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
    const { amount } = await request.json();
    
    if (!amount || typeof amount !== "string") {
      return NextResponse.json(
        { error: "Amount is required and must be a string" },
        { status: 400 }
      );
    }
    
    const updatedSavedMoney = await SavedMoneyService.updateSavedMoney({ amount });
    
    return NextResponse.json({ amount: updatedSavedMoney.amount });
  } catch (error) {
    console.error("Error updating saved money:", error);
    return NextResponse.json(
      { error: "Failed to update saved money" },
      { status: 500 }
    );
  }
}
