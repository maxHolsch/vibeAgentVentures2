import { NextResponse } from "next/server";
import { loadIndexSummary } from "@/lib/store";

export const dynamic = "force-static";

export async function GET() {
  try {
    const summary = await loadIndexSummary();
    return NextResponse.json(summary);
  } catch (e) {
    return NextResponse.json({ hasIndex: false, chunks: 0, docs: 0 });
  }
}
