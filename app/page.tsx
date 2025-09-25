"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Status = { hasIndex: boolean; chunks: number; docs: number };

export default function Page() {
  const [status, setStatus] = useState<Status | null>(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Array<{ title: string; path: string; score: number }>>([]);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      setStatus({ hasIndex: false, chunks: 0, docs: 0 });
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const canAsk = useMemo(() => status?.hasIndex && question.trim().length > 3 && !loading, [status, question, loading]);

  const onAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAsk) return;
    setLoading(true);
    setAnswer("");
    setSources([]);
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: controllerRef.current.signal,
      });
      const data = await res.json();
      setAnswer(data.answer || "");
      setSources(data.sources || []);
    } catch (e) {
      setAnswer("There was an error answering your question.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <section style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        animation: 'fadeIn 0.6s ease-out'
      }}>
        <div style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          marginBottom: 24,
          padding: '16px 20px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: status?.hasIndex ? 'linear-gradient(45deg, #4ade80, #22d3ee)' : 'linear-gradient(45deg, #f87171, #fb7185)',
            boxShadow: status?.hasIndex ? '0 0 20px rgba(74, 222, 128, 0.4)' : '0 0 20px rgba(248, 113, 113, 0.4)',
            animation: status?.hasIndex ? 'pulse 2s infinite' : 'none'
          }} />
          <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem', fontWeight: '500' }}>
            {status?.hasIndex ? (
              <span>Index ready — {status.chunks} chunks from {status.docs} files</span>
            ) : (
              <span>No index found. Run the ingest script to add your applications.</span>
            )}
          </div>
        </div>
        <form onSubmit={onAsk} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ position: 'relative' }}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask something like: 'Draft a 150-word answer about my teamwork experience'"
              rows={4}
              style={{
                width: '100%',
                resize: 'vertical',
                padding: '20px',
                fontSize: '1rem',
                color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                outline: 'none',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit',
                lineHeight: 1.6
              }}
              onFocus={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.border = '2px solid rgba(255, 255, 255, 0.3)';
                target.style.background = 'rgba(255, 255, 255, 0.12)';
              }}
              onBlur={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.border = '2px solid rgba(255, 255, 255, 0.1)';
                target.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={!canAsk}
              style={{
                background: canAsk ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: 'none',
                padding: '14px 28px',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '12px',
                cursor: canAsk ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                boxShadow: canAsk ? '0 8px 25px rgba(102, 126, 234, 0.3)' : 'none',
                opacity: canAsk ? 1 : 0.6,
                transform: canAsk ? 'translateY(0)' : 'translateY(2px)'
              }}
              onMouseEnter={(e) => {
                if (canAsk) {
                  const target = e.target as HTMLElement;
                  target.style.transform = 'translateY(-2px)';
                  target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (canAsk) {
                  const target = e.target as HTMLElement;
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                }
              }}
            >
              {loading ? 'Thinking…' : 'Ask'}
            </button>
            <div style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span style={{ fontSize: '1rem' }}>✨</span>
              <span>Powered by BM25 retrieval + Anthropic Claude</span>
            </div>
          </div>
        </form>
      </section>

      {answer && (
        <section style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          animation: 'fadeIn 0.8s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🧠</span>
            <h3 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '600',
              background: 'linear-gradient(45deg, #4ade80, #22d3ee)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>AI Answer</h3>
          </div>
          <div style={{
            whiteSpace: 'pre-wrap',
            lineHeight: 1.8,
            fontSize: '1.1rem',
            color: 'rgba(255, 255, 255, 0.95)',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>{answer}</div>
          {!!sources.length && (
            <div style={{
              marginTop: 32,
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: 16,
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                <span style={{ fontSize: '1.2rem' }}>📚</span>
                <span>Sources</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sources.map((s, i) => (
                  <div key={i} style={{
                    padding: '16px 20px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLDivElement;
                    target.style.background = 'rgba(255, 255, 255, 0.08)';
                    target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLDivElement;
                    target.style.background = 'rgba(255, 255, 255, 0.05)';
                    target.style.transform = 'translateY(0)';
                  }}>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.95)',
                      fontWeight: '600',
                      fontSize: '1rem',
                      marginBottom: '4px'
                    }}>{s.title}</div>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.9rem',
                      fontFamily: 'Monaco, Consolas, monospace'
                    }}>{s.path}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
