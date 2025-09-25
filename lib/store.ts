import fs from 'node:fs/promises';
import path from 'node:path';
import type { EmbeddingIndex } from './types';

const INDEX_PATH = path.join(process.cwd(), 'data', 'index.json');

export async function loadIndex(): Promise<EmbeddingIndex | null> {
  try {
    const buf = await fs.readFile(INDEX_PATH, 'utf8');
    const json = JSON.parse(buf) as EmbeddingIndex;
    if (!json?.chunks?.length) return null;
    return json;
  } catch {
    return null;
  }
}

export async function loadIndexSummary(): Promise<{ hasIndex: boolean; chunks: number; docs: number }> {
  const idx = await loadIndex();
  if (!idx) return { hasIndex: false, chunks: 0, docs: 0 };
  const docs = new Set(idx.chunks.map(c => c.path)).size;
  return { hasIndex: true, chunks: idx.chunks.length, docs };
}
