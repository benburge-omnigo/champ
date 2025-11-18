import React from 'react';
import './App.css'
import BugSquashGame from './BugSquashGame';

function App() {
  // ...existing code...

  // Simple route handling without dependencies
  // Show hero and CTA, then BugSquashGame after clicking CTA
  const [showGame, setShowGame] = React.useState(false);
  if (showGame) {
    return <BugSquashGame />;
  }
  return (
    <>
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
            onClick={() => setShowGame(true)}
          >
            Start Bug Squash Game
          </button>
        </div>
      </section>
    </>
  );
  // ...existing code removed: always show BugSquashGame
}

export default App
