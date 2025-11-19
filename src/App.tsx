import React from 'react';
import './App.css'
import BugSquashGame from './BugSquashGame';
import Thanks from './Thanks';

function MatrixBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    // Matrix columns
    const fontSize = 22;
    const columns = Math.floor(w / fontSize);
    const drops: number[] = Array(columns).fill(1);
    const chars = 'アァイィウヴエカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    function draw() {
      if (!ctx) return;
      ctx.fillStyle = 'rgba(40, 40, 60, 0.18)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = fontSize + 'px monospace';
      ctx.fillStyle = '#4ade80'; // Soft green
      for (let i = 0; i < columns; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > h && Math.random() > 0.985) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationFrameId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="matrix-bg">
      <canvas ref={canvasRef} className="matrix-canvas" />
    </div>
  );
}

function App() {
  // Navigation state: 'home', 'bug', 'leader'
  const [view, setView] = React.useState<'home' | 'bug' | 'leader' | 'thanks'>('home');

  // Top navigation bar
  const navStyle = {
    width: '100%',
    background: '#6366f1',
    padding: '0.75rem 0',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    zIndex: 100,
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    fontSize: '1.25rem',
    fontWeight: 600,
    boxShadow: '0 2px 12px rgba(99,102,241,0.10)',
  };
  const btnStyle = (active: boolean) => ({
    background: 'none',
    border: 'none',
    color: active ? '#fff' : '#e0e7ff',
    cursor: 'pointer',
    padding: '0.5rem 1.5rem',
    borderBottom: active ? '3px solid #fff' : 'none',
    borderRadius: '0.5rem 0.5rem 0 0',
  });

  return (
    <div style={{ paddingTop: '4.5rem', position: 'relative', minHeight: '100vh' }}>
      <MatrixBackground />
      <nav style={navStyle}>
        <button style={btnStyle(view === 'home')} onClick={() => setView('home')}>Home</button>
        <button style={btnStyle(view === 'bug')} onClick={() => setView('bug')}>Bug Squash</button>
        <button style={btnStyle(view === 'leader')} onClick={() => setView('leader')}>Leader</button>
        <button style={btnStyle(view === 'thanks')} onClick={() => setView('thanks')}>Thanks</button>
      </nav>
      {view === 'home' && (
        <section className="hero-section" style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          background: 'linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%)',
          padding: '4rem 1rem',
          gap: '3rem',
        }}>
          <img
            src="benomnigo2.png"
            alt="Omnigo Champion"
            style={{
              width: '700px',
              maxWidth: '45vw',
              borderRadius: '2rem',
              boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
              border: '8px solid #6366f1',
              flexShrink: 0,
            }}
          />
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            maxWidth: '600px',
          }}>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: 900,
              color: '#1e293b',
              marginBottom: '1.5rem',
              textShadow: '0 4px 16px rgba(0,0,0,0.10)',
            }}>
              Omnigo Champion
            </h1>
            <p style={{
              fontSize: '1.5rem',
              color: '#334155',
              textAlign: 'left',
            }}>
            Squash bugs, claim glory, become a champion!
            </p>
            <button
              style={{
                padding: '0.75rem 2rem',
                fontSize: '1.25rem',
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '1rem',
                cursor: 'pointer',
                textDecoration: 'none',
                marginTop: '2rem',
                display: 'inline-block',
              }}
              onClick={() => setView('bug')}
            >
              Start Bug Squash Game
            </button>
          </div>
        </section>
      )}
      {view === 'bug' && (
        <BugSquashGame view="bug" setView={setView} />
      )}
      {view === 'leader' && (
        <BugSquashGame view="leader" setView={setView} />
      )}
      {view === 'thanks' && (
        <Thanks />
      )}
    </div>
  );
}

export default App
