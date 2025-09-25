import type { Chunk } from './types';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

type Stats = {
  N: number;
  avgdl: number;
  df: Map<string, number>;
  tfs: Array<Map<string, number>>;
  lengths: number[];
};

function computeStats(chunks: Chunk[]): Stats {
  const N = chunks.length;
  const df = new Map<string, number>();
  const tfs: Array<Map<string, number>> = [];
  const lengths: number[] = [];
  let totalLen = 0;

  for (const c of chunks) {
    const tokens = tokenize(c.text);
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
    tfs.push(tf);
    lengths.push(tokens.length);
    totalLen += tokens.length;
    // update df per term once per doc
    for (const term of new Set(tokens)) df.set(term, (df.get(term) || 0) + 1);
  }
  const avgdl = N ? totalLen / N : 0;
  return { N, avgdl, df, tfs, lengths };
}

function idf(term: string, N: number, df: number) {
  // BM25 IDF with +1 to avoid negative values
  return Math.log( ( (N - df + 0.5) / (df + 0.5) ) + 1 );
}

export function bm25Rank(query: string, chunks: Chunk[], k1 = 1.5, b = 0.75) {
  if (!chunks.length) return [] as Array<{ chunk: Chunk; score: number }>;
  const stats = computeStats(chunks);
  const qTerms = Array.from(new Set(tokenize(query)));

  const scores: Array<{ chunk: Chunk; score: number }> = chunks.map((c, i) => ({ chunk: c, score: 0 }));
  for (let i = 0; i < chunks.length; i++) {
    let s = 0;
    const tf = stats.tfs[i];
    const dl = stats.lengths[i];
    for (const term of qTerms) {
      const df = stats.df.get(term) || 0;
      if (df === 0) continue;
      const termIdf = idf(term, stats.N, df);
      const freq = tf.get(term) || 0;
      const denom = freq + k1 * (1 - b + b * (dl / (stats.avgdl || 1)));
      const contrib = termIdf * ((freq * (k1 + 1)) / (denom || 1));
      s += contrib;
    }
    scores[i].score = s;
  }
  scores.sort((a, b) => b.score - a.score);
  return scores;
}

