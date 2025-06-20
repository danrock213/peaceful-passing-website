import { NextRequest, NextResponse } from "next/server";
import { getTributeById, saveTribute, deleteTribute } from "@/lib/data/tributes";
import { Tribute } from "@/types/tribute";

// Use `any` for the context parameter to satisfy TypeScript
export async function GET(req: NextRequest, context: any) {
  const { id } = context.params as { id: string };
  const tribute = getTributeById(id);
  if (!tribute) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(tribute);
}

export async function PUT(req: NextRequest, context: any) {
  const { id } = context.params as { id: string };
  const incoming: Partial<Tribute> = await req.json();

  const existing = getTributeById(id);
  if (!existing) return NextResponse.json({ error: "Tribute not found" }, { status: 404 });

  const updatedTribute: Tribute = {
    ...existing,
    ...incoming,
    id,
    createdBy: existing.createdBy,
  };

  const saved = await saveTribute(updatedTribute);
  return NextResponse.json(saved);
}

export async function DELETE(req: NextRequest, context: any) {
  const { id } = context.params as { id: string };
  const deleted = await deleteTribute(id);
  if (!deleted) return NextResponse.json({ error: "Failed to delete tribute" }, { status: 500 });
  return NextResponse.json({ success: true });
}
