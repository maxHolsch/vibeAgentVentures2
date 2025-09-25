/*
  Ingests files from a local directory (your `applications` folder), chunks them,
  and writes data/index.json used by the app for BM25 retrieval (no embeddings).

  Usage:
    npx ts-node --transpile-only scripts/ingest.ts ./path/to/applications

  Supported file types: .txt, .md
*/
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
type Chunk = { id: string; title: string; path: string; text: string };
type EmbeddingIndex = { createdAt: string; chunks: Chunk[] };

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

async function readTextFile(file: string) {
  const ext = path.extname(file).toLowerCase();
  if (ext !== '.txt' && ext !== '.md') return null;
  try {
    const raw = await fs.readFile(file, 'utf8');
    return raw.replace(/\r\n?/g, '\n');
  } catch {
    return null;
  }
}

function chunkText(text: string, chunkSize = 1800, overlap = 200): string[] {
  const chunks: string[] = [];
  const step = Math.max(1, chunkSize - overlap);
  for (let start = 0; start < text.length; start += step) {
    const end = Math.min(text.length, start + chunkSize);
    const slice = text.slice(start, end).trim();
    if (slice) chunks.push(slice);
    if (end === text.length) break;
  }
  return chunks.length ? chunks : [text];
}

async function main() {
  const dir = process.argv[2] || process.env.APPLICATIONS_DIR;
  if (!dir) {
    console.error('Usage: ts-node scripts/ingest.ts ./path/to/applications');
    process.exit(1);
  }

  const files: string[] = [];
  for await (const f of walk(dir)) files.push(f);
  const textFiles = files.filter(f => ['.txt', '.md'].includes(path.extname(f).toLowerCase()));
  if (textFiles.length === 0) {
    console.error('No .txt or .md files found in directory.');
    process.exit(1);
  }

  const chunks: Chunk[] = [];
  for (const f of textFiles) {
    const content = await readTextFile(f);
    if (!content) continue;
    const title = path.basename(f);
    const relPath = path.relative(process.cwd(), f);
    const parts = chunkText(content);
    for (const p of parts) {
      const id = crypto.createHash('sha1').update(relPath + '|' + p.slice(0, 32)).digest('hex');
      chunks.push({ id, title, path: relPath, text: p });
      process.stdout.write(`Chunked: ${title}  (total: ${chunks.length})\r`);
    }
  }

  const index: EmbeddingIndex = { createdAt: new Date().toISOString(), chunks };
  const outDir = path.join(process.cwd(), 'data');
  const outFile = path.join(outDir, 'index.json');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outFile, JSON.stringify(index));
  console.log(`\nWrote ${chunks.length} chunks to ${outFile}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
