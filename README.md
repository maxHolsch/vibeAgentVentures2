Applications RAG Agent (Next.js + Anthropic)

Build and deploy an agent that answers new job application questions using your past applications as context via RAG.

Features
- Backend: Next.js API routes on Vercel (Node runtime)
- Frontend: Minimal UI to ask questions and view sources
- RAG: Local ingestion script that chunks your `applications/` folder; BM25 retrieval (no external embeddings)
- Models: Anthropic Claude for answers (default `claude-3-5-haiku-latest`)

Quick Start
1) Install deps
   - Node 18+
   - `npm install`

2) Ingest your applications
   - Put your past application files in a local folder (e.g. `~/applications`) as `.txt` or `.md` files.
   - Run the script:
     ```bash
     npx ts-node --transpile-only scripts/ingest.ts ~/applications
     # or: npm run ingest -- ~/applications
     ```
   - This writes `data/index.json` with embeddings.
   - This writes `data/index.json` with chunks (no embeddings).

3) Run locally
   ```bash
   export ANTHROPIC_API_KEY=sk-ant-...
   npm run dev
   ```
   - Open http://localhost:3000

4) Deploy to Vercel
   - Create a new Vercel project and link this repo.
   - In Vercel Project Settings → Environment Variables, add:
     - `ANTHROPIC_API_KEY` = your key
     - Optional: `CHAT_MODEL` (default `claude-3-5-haiku-latest`)
   - Commit `data/index.json` to your repo so it is available at runtime (read-only) on Vercel.
   - Push to your repository; Vercel will build and deploy.

Usage
- The home page shows whether an index is available and how many chunks/docs were loaded.
- Ask your question; the API retrieves top relevant chunks (BM25) and calls Claude to answer grounded in those sources.

Notes
- Supported ingest types: `.txt`, `.md`. Convert PDFs to text first for best results.
- For ongoing updates, re-run the ingest script and commit the updated `data/index.json`.
- Advanced: You can extend to persistent storage (Vercel Blob/KV or a vector DB) and add upload UI.
