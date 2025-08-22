import { CreateFundInput, FundService } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await FundService.initializeDatabase();
    const funds = await FundService.getAllFunds();
    return NextResponse.json(funds);
  } catch (error) {
    console.error("Error fetching funds:", error);
    return NextResponse.json(
      { error: "Failed to fetch funds" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, price }: CreateFundInput = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (typeof price !== 'string' || !price.trim()) {
      return NextResponse.json(
        { error: "Price is required" },
        { status: 400 }
      );
    }

    // Validate that price contains only numbers, commas, and periods
    if (!/^[\d,\.]+$/.test(price.trim())) {
      return NextResponse.json(
        { error: "Price must contain only numbers, commas, and periods" },
        { status: 400 }
      );
    }

    await FundService.initializeDatabase();
    const fund = await FundService.createFund({
      title: title.trim(),
      price: price.trim(),
    });

    return NextResponse.json(fund, { status: 201 });
  } catch (error) {
    console.error("Error creating fund:", error);
    return NextResponse.json(
      { error: "Failed to create fund" },
      { status: 500 }
    );
  }
}
