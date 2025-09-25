export const metadata = {
  title: "Vibe Agent Ventures",
  description: "Your AI-powered career companion for intelligent job application insights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff',
          margin: 0,
          minHeight: '100vh',
          lineHeight: 1.6
        }}>
        <div style={{
          maxWidth: 1000,
          margin: '0 auto',
          padding: '20px',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <header style={{
            textAlign: 'center',
            marginBottom: 40,
            padding: '40px 20px'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '10px',
              fontWeight: '700',
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
              backgroundSize: '200% 200%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              animation: 'gradient 3s ease infinite'
            }}>🚀 Vibe Agent Ventures</div>
            <p style={{
              margin: 0,
              fontSize: '1.2rem',
              opacity: 0.9,
              maxWidth: '600px',
              margin: '0 auto',
              fontWeight: '300'
            }}>
              Your AI-powered career companion for intelligent job application insights
            </p>
          </header>
          {children}
          <footer style={{
            marginTop: 'auto',
            textAlign: 'center',
            padding: '40px 20px 20px',
            opacity: 0.7,
            fontSize: '0.9rem'
          }}>
            <div style={{ marginBottom: '10px' }}>Built with ❤️ using Next.js + Anthropic Claude</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Add your data via the ingest script to get started</div>
          </footer>
        </div>
      </body>
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * {
          box-sizing: border-box;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </html>
  );
}

