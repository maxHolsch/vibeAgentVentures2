import { NextRequest, NextResponse } from "next/server";
import { loadIndex } from "@/lib/store";
import { bm25Rank } from "@/lib/retrieval";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question || typeof question !== 'string' || question.trim().length < 3) {
      return NextResponse.json({ error: "Question required" }, { status: 400 });
    }

    const index = await loadIndex();
    if (!index) {
      return NextResponse.json({ error: "No index found. Run ingestion." }, { status: 400 });
    }

    // Rank chunks and normalize scores to [0,1] to avoid tiny values rounding to 0.000 in UI
    const scored = bm25Rank(question, index.chunks).slice(0, 8);
    const maxScore = scored[0]?.score || 0;
    const normalized = maxScore > 0
      ? scored.map(s => ({ chunk: s.chunk, score: s.score / maxScore }))
      : scored;

    const context = scored.map(s => `Source: ${s.chunk.title} (${s.chunk.path})\n---\n${s.chunk.text}`).join("\n\n");

    const system = `You are a helpful assistant that writes concise, direct answers using ONLY the provided context from prior job applications.\n- If the answer isn't in the context, say you don't have enough information.\n- Prefer quoting specific details.\n- Keep answers under 180 words unless asked otherwise.\n- Cite the most relevant sources by file name when helpful.`;

    const messages = [
      { role: 'system' as const, content: system },
      { role: 'user' as const, content: `Question: ${question}\n\nContext:\n${context}` }
    ];

    const { responseText } = await import("@/lib/anthropic").then(m => m.chat(messages));

    return NextResponse.json({
      answer: responseText,
      // Return normalized scores for clearer display
      sources: normalized.map(s => ({ title: s.chunk.title, path: s.chunk.path, score: s.score }))
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
