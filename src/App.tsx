import React from 'react';
import './App.css'
import BugSquashGame from './BugSquashGame';

function App() {
  // Navigation state: 'home', 'bug', 'leader'
  const [view, setView] = React.useState<'home' | 'bug' | 'leader'>('home');

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
    <div style={{ paddingTop: '4.5rem' }}>
      <nav style={navStyle}>
        <button style={btnStyle(view === 'home')} onClick={() => setView('home')}>Home</button>
        <button style={btnStyle(view === 'bug')} onClick={() => setView('bug')}>Bug Squash</button>
        <button style={btnStyle(view === 'leader')} onClick={() => setView('leader')}>Leader</button>
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
              Welcome to the Omnigo Champion app. Celebrate your achievements and explore new challenges!
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
    </div>
  );
}

export default App
