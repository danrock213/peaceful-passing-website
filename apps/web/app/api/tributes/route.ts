// File location: app/api/tributes/route.ts

import { NextResponse } from "next/server";
import { getTributes, saveTribute } from "@/lib/api/tributeApi";
import { Tribute } from "@/types/tribute";

// GET all tributes
export async function GET() {
  try {
    const tributes = await getTributes();
    return NextResponse.json(tributes);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch tributes" }, { status: 500 });
  }
}

// POST create a new tribute
export async function POST(req: Request) {
  try {
    const tribute: Tribute = await req.json();
    const savedTribute = await saveTribute(tribute);
    return NextResponse.json(savedTribute, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save tribute" }, { status: 500 });
  }
}
