import React, { useState, useRef, useEffect } from 'react';
// Generate squash sound effect using Web Audio API
let squashAudioCtx: AudioContext | null = null;
function playSquashSound() {
  try {
    if (!squashAudioCtx || squashAudioCtx.state === 'closed') {
      squashAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = squashAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.22);
    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  } catch (e) {
    // Ignore errors
  }
}
// Leaderboard API constants
const API_URL = 'https://bafgo.com/api/dynamic/champleader';
const API_TOKEN = '5219f6fd95dc4e6cc485ba78664179306e697650700c727b694e049e7f0e9316';
import './BugSquashGame.css';

const GAME_WIDTH = 900;
const GAME_HEIGHT = 500;

const BUG_SIZE = 40;
const CODE_SIZE = 60;
const BUG_COUNT = 5;
const CODE_COUNT = 3;
const GAME_TIME = 20; // seconds


function getRandomBugPosition() {
  return {
    left: Math.random() * (GAME_WIDTH - BUG_SIZE),
    top: Math.random() * (GAME_HEIGHT - BUG_SIZE),
  };
}

function getRandomCodePosition() {
  return {
    left: Math.random() * (GAME_WIDTH - CODE_SIZE),
    top: Math.random() * (GAME_HEIGHT - CODE_SIZE),
  };
}

interface BugSquashGameProps {
  view?: 'bug' | 'leader';
  setView?: (v: 'home' | 'bug' | 'leader') => void;
}

const BugSquashGame: React.FC<BugSquashGameProps> = ({ view: propView, setView: propSetView }) => {
  // Internal navigation state if not provided by props
  const [internalView, setInternalView] = useState<'bug' | 'leader'>(propView || 'bug');
  const view = propView || internalView;
  const setView = propSetView || ((v: 'home' | 'bug' | 'leader') => {
    if (v === 'bug' || v === 'leader') setInternalView(v);
  });



  const [score, setScore] = useState(0);
  const [regressions, setRegressions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [bugs, setBugs] = useState(Array.from({ length: BUG_COUNT }, getRandomBugPosition));
  const [squashedIdx, setSquashedIdx] = useState<number | null>(null);
  // No audioRef needed for Web Audio API
  const [codes, setCodes] = useState(Array.from({ length: CODE_COUNT }, getRandomCodePosition));
  const [running, setRunning] = useState(false);
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('displayName') || '');
  const [showModal, setShowModal] = useState(false);
  const [modalInput, setModalInput] = useState('');
  const [leaderboard, setLeaderboard] = useState<Array<{name: string, score: number, regressions: number, date: string}>>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [errorLeaderboard, setErrorLeaderboard] = useState('');
  const timerRef = useRef<number | null>(null);
  // Fetch leaderboard from API
  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    setErrorLeaderboard('');
    try {
      const res = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const data = await res.json();
      // Expecting { success, items: [...] }
      if (data && data.items && Array.isArray(data.items)) {
        // Map, sort, and filter to only top score per unique name
        const mapped = data.items.map((item: any) => ({
          name: item.name,
          score: item.score,
          regressions: item.regressions,
          date: item.date || item.createdAt || '',
        }));
        // Sort by score desc, regressions asc
        mapped.sort((a: {score: number, regressions: number}, b: {score: number, regressions: number}) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.regressions - b.regressions;
        });
        // Only keep top score for each unique name
        const uniqueLeaderboard: typeof mapped = [];
        const seenNames = new Set<string>();
        for (const entry of mapped) {
          if (!seenNames.has(entry.name)) {
            uniqueLeaderboard.push(entry);
            seenNames.add(entry.name);
          }
        }
        setLeaderboard(uniqueLeaderboard);
      } else {
        setLeaderboard([]);
      }
    } catch (err: any) {
      setErrorLeaderboard(err.message || 'Error loading leaderboard');
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Post score to API after game ends
  const postScore = async () => {
    if (!displayName || score === 0) return;
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: displayName,
          score,
          regressions,
          date: new Date().toISOString(),
        }),
      });
      fetchLeaderboard();
    } catch (err) {
      // Optionally handle error
    }
  };



  // Move bugs every 1s
  useEffect(() => {
    if (!running) return;
    const bugInterval = setInterval(() => {
      setBugs(bugs => bugs.map(() => getRandomBugPosition()));
    }, 1000);
    return () => clearInterval(bugInterval);
  }, [running]);


  // Move code blocks every 300ms
  useEffect(() => {
    if (!running) return;
    const codeInterval = setInterval(() => {
      setCodes(codes => codes.map(() => getRandomCodePosition()));
    }, 300);
    return () => clearInterval(codeInterval);
  }, [running]);

  // Timer logic
  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setRunning(false);
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [running]);

  // When game ends, post score and show leaderboard
  useEffect(() => {
    if (!running && timeLeft === 0) {
      postScore();
      setView('leader');
    }
    // eslint-disable-next-line
  }, [running, timeLeft]);

  // Fetch leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, []);




  // Modal logic for display name
  useEffect(() => {
    if (!displayName) {
      setShowModal(true);
    }
  }, [displayName]);

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = modalInput.trim();
    if (name) {
      setDisplayName(name);
      localStorage.setItem('displayName', name);
      setShowModal(false);
      setModalInput('');
    }
  };

  // Reset game
  const startGame = () => {
    if (!displayName) {
      setShowModal(true);
      return;
    }
    setScore(0);
    setRegressions(0);
    setTimeLeft(GAME_TIME);
    setBugs(Array.from({ length: BUG_COUNT }, getRandomBugPosition));
    setCodes(Array.from({ length: CODE_COUNT }, getRandomCodePosition));
    setRunning(true);
  };


  // Squash bug
  // Track which bug is animating to prevent double squashes
  const [animatingBug, setAnimatingBug] = useState<number | null>(null);

  const squashBug = (idx: number, e?: React.MouseEvent) => {
    if (!running) return;
    if (animatingBug !== null) return; // Prevent double squashes
    // Optional: check if click is inside SVG (for more accuracy)
    if (e && e.target instanceof SVGElement) {
      const rect = e.target.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return;
      }
    }
    setScore(s => s + 1);
    setSquashedIdx(idx);
    setAnimatingBug(idx);
    playSquashSound();
    setTimeout(() => {
      setBugs(bugs => bugs.map((bug, i) => (i === idx ? getRandomBugPosition() : bug)));
      setSquashedIdx(null);
      setAnimatingBug(null);
    }, 180);
  };


  // Click code block (penalty)
  const hitCode = (idx: number) => {
    if (!running) return;
    setScore(s => (s > 0 ? s - 1 : 0));
    setRegressions(r => r + 1);
    setCodes(codes => codes.map((code, i) => (i === idx ? getRandomCodePosition() : code)));
  };

    return (
      <div className="bug-squash-container" style={{ paddingTop: '4.5rem' }}>
      {/* Top Navigation */}
      <nav style={{
        width: '100%',
        background: '#6366f1',
        padding: '0.75rem 0',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        fontSize: '1.25rem',
        fontWeight: 600,
        boxShadow: '0 2px 12px rgba(99,102,241,0.10)',
      }}>
        <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', color: propView ? '#e0e7ff' : '#fff', cursor: 'pointer', padding: '0.5rem 1.5rem', borderBottom: propView ? 'none' : '3px solid #fff', borderRadius: '0.5rem 0.5rem 0 0' }}>Home</button>
        <button onClick={() => setView('bug')} style={{ background: 'none', border: 'none', color: view === 'bug' ? '#fff' : '#e0e7ff', cursor: 'pointer', padding: '0.5rem 1.5rem', borderBottom: view === 'bug' ? '3px solid #fff' : 'none', borderRadius: '0.5rem 0.5rem 0 0' }}>Bug Squash</button>
        <button onClick={() => setView('leader')} style={{ background: 'none', border: 'none', color: view === 'leader' ? '#fff' : '#e0e7ff', cursor: 'pointer', padding: '0.5rem 1.5rem', borderBottom: view === 'leader' ? '3px solid #fff' : 'none', borderRadius: '0.5rem 0.5rem 0 0' }}>Leader</button>
      </nav>
      {/* Bug Squash View: Game UI */}
      {view === 'bug' && (
        <>
          <h2>Bug Squash Game</h2>
          {displayName && (
            <div style={{ fontSize: '1.1rem', color: '#6366f1', marginBottom: '0.5rem' }}>
              Player: <b>{displayName}</b>
            </div>
          )}
          <div className="bug-squash-info">
          <button
            style={{
              marginBottom: '1rem',
              padding: '0.5rem 1.5rem',
              fontSize: '1rem',
              background: '#f59e42',
              color: '#fff',
              border: 'none',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(245,158,66,0.10)',
            }}
            onClick={playSquashSound}
          >Test Squash Sound</button>
            <span>Bugs Fixed: <b>{score}</b></span>
            <span>Regressions: <b style={{ color: regressions > 0 ? '#dc2626' : '#334155' }}>{regressions}</b></span>
            <span>Time: <b>{timeLeft}</b>s</span>
          </div>
          <button className="bug-squash-start" onClick={startGame} disabled={running || showModal}>
            {running ? 'Game Running...' : 'Start Game'}
          </button>
          {/* Modal for display name input */}
          {showModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(30,41,59,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}>
              <form onSubmit={handleModalSubmit} style={{
                background: '#fff',
                borderRadius: '1.5rem',
                boxShadow: '0 8px 32px rgba(99,102,241,0.18)',
                padding: '2.5rem 2rem',
                minWidth: '320px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <h3 style={{ color: '#6366f1', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1rem' }}>Enter Display Name</h3>
                <input
                  type="text"
                  value={modalInput}
                  onChange={e => setModalInput(e.target.value)}
                  placeholder="Your name..."
                  style={{
                    fontSize: '1.1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    border: '2px solid #6366f1',
                    marginBottom: '1.5rem',
                    width: '100%',
                    outline: 'none',
                  }}
                  autoFocus
                  maxLength={32}
                />
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 2rem',
                    fontSize: '1.1rem',
                    background: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '1rem',
                    cursor: modalInput.trim() ? 'pointer' : 'not-allowed',
                    opacity: modalInput.trim() ? 1 : 0.6,
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
                  }}
                  disabled={!modalInput.trim()}
                >Continue</button>
              </form>
            </div>
          )}
          <div className="bug-squash-game-area" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
            {/* Bugs */}
            {bugs.map((bug, idx) => (
              <div
                key={"bug-" + idx}
                className={`bug-squash-bug${squashedIdx === idx ? ' squashed' : ''}`}
                style={{ left: bug.left, top: bug.top, width: BUG_SIZE, height: BUG_SIZE, pointerEvents: animatingBug === idx ? 'none' : 'auto' }}
                onMouseDown={e => squashBug(idx, e)}
              >
                {/* SVG bug icon */}
                <svg width={BUG_SIZE} height={BUG_SIZE} viewBox="0 0 40 40">
                  <ellipse cx="20" cy="24" rx="12" ry="10" fill="#4B2E09" />
                  <ellipse cx="20" cy="16" rx="8" ry="7" fill="#8B5C2A" />
                  <circle cx="20" cy="13" r="3" fill="#F59E42" />
                  <line x1="8" y1="24" x2="0" y2="10" stroke="#222" strokeWidth="2" />
                  <line x1="32" y1="24" x2="40" y2="10" stroke="#222" strokeWidth="2" />
                  <line x1="12" y1="34" x2="6" y2="40" stroke="#222" strokeWidth="2" />
                  <line x1="28" y1="34" x2="34" y2="40" stroke="#222" strokeWidth="2" />
                </svg>
              </div>
            ))}
            {/* No audio element needed for Web Audio API */}
            {/* Code blocks */}
            {codes.map((code, idx) => (
              <div
                key={"code-" + idx}
                className="bug-squash-code"
                style={{ left: code.left, top: code.top, width: CODE_SIZE, height: CODE_SIZE }}
                onClick={() => hitCode(idx)}
              >
                <pre style={{
                  background: '#e0e7ff',
                  color: '#334155',
                  fontSize: '0.85rem',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  margin: 0,
                  textAlign: 'left',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre',
                  border: '2px solid #6366f1',
                }}>
                  {`const value = 42;\nfunction greet() {\n  return "Hello";\n}`}
                </pre>
              </div>
            ))}
            {!running && timeLeft !== GAME_TIME && (
              <div className="bug-squash-end">
                <h3>Game Over!</h3>
                <p>Bugs Fixed: <b>{score}</b></p>
                <p>Regressions: <b style={{ color: regressions > 0 ? '#dc2626' : '#334155' }}>{regressions}</b></p>
                <p>🎉 Omnigo Champion! 🎉</p>
              </div>
            )}
          </div>
          <div className="bug-squash-instructions">
            <span style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}>
              <svg width="32" height="32" viewBox="0 0 40 40" style={{ verticalAlign: 'middle' }}>
                <ellipse cx="20" cy="24" rx="12" ry="10" fill="#4B2E09" />
                <ellipse cx="20" cy="16" rx="8" ry="7" fill="#8B5C2A" />
                <circle cx="20" cy="13" r="3" fill="#F59E42" />
                <line x1="8" y1="24" x2="0" y2="10" stroke="#222" strokeWidth="2" />
                <line x1="32" y1="24" x2="40" y2="10" stroke="#222" strokeWidth="2" />
                <line x1="12" y1="34" x2="6" y2="40" stroke="#222" strokeWidth="2" />
                <line x1="28" y1="34" x2="34" y2="40" stroke="#222" strokeWidth="2" />
              </svg>
            </span>
            <b>Squash the bugs</b> <span style={{ color: '#6366f1', fontWeight: 500 }}>&mdash; but avoid causing regressions!</span>
            <div style={{ fontSize: '1rem', marginTop: '0.25rem', color: '#64748b' }}>
              Click bugs to fix them. Avoid clicking code blocks, or you'll cause a regression and lose points!
            </div>
          </div>
        </>
      )}
      {/* Leaderboard View: Only show when view is 'leader' */}
      {view === 'leader' && (
        <div className="bug-squash-leaderboard" style={{ marginTop: '2.5rem', background: '#f3f4f6', borderRadius: '1.5rem', boxShadow: '0 4px 24px rgba(99,102,241,0.10)', padding: '2rem', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto', position: 'relative' }}>
          <h3 style={{ color: '#6366f1', fontWeight: 700, fontSize: '2rem', marginBottom: '1rem', textAlign: 'center', letterSpacing: '0.05em' }}>Leaderboard</h3>
          <button onClick={fetchLeaderboard} style={{ marginBottom: '1rem', background: 'linear-gradient(90deg,#6366f1,#f59e42)', color: '#fff', border: 'none', borderRadius: '0.75rem', padding: '0.5rem 1.5rem', fontSize: '1rem', cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 8px rgba(99,102,241,0.10)' }}>Refresh</button>
          {loadingLeaderboard ? (
            <div style={{ textAlign: 'center', color: '#64748b' }}>Loading...</div>
          ) : errorLeaderboard ? (
            <div style={{ color: '#dc2626', textAlign: 'center' }}>{errorLeaderboard}</div>
          ) : leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b' }}>No scores yet.</div>
          ) : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Podium for top 3 */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '2.5rem', marginBottom: '2.5rem', width: '100%' }}>
                {/* Second Place */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#64748b', fontSize: '1.15rem', marginBottom: '0.5rem' }}>2nd</div>
                  <div style={{ background: 'linear-gradient(180deg,#e0e7ff,#cbd5e1)', borderRadius: '1rem 1rem 0 0', width: '110px', height: '90px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.10)', border: '3px solid #a3a3a3' }}>
                    <div style={{ fontWeight: 700, color: leaderboard[1]?.name === displayName ? '#6366f1' : '#64748b', fontSize: '1.2rem', marginBottom: '0.2rem' }}>{leaderboard[1]?.name || '-'}</div>
                    <div style={{ color: '#334155', fontSize: '1.1rem' }}>Score: <b>{leaderboard[1]?.score ?? '-'}</b></div>
                    <div style={{ color: leaderboard[1]?.regressions > 0 ? '#dc2626' : '#334155', fontSize: '0.95rem' }}>Reg: {leaderboard[1]?.regressions ?? '-'}</div>
                  </div>
                </div>
                {/* First Place */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                  <div style={{ fontWeight: 600, color: '#f59e42', fontSize: '1.25rem', marginBottom: '0.5rem' }}>1st</div>
                  <div style={{ background: 'linear-gradient(180deg,#f59e42,#fde68a)', borderRadius: '1rem 1rem 0 0', width: '130px', height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(245,158,66,0.18)', border: '4px solid #f59e42', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '-32px', left: '50%', transform: 'translateX(-50%)', }}>
                      {/* Trophy SVG */}
                      <svg width="38" height="38" viewBox="0 0 24 24" fill="gold" style={{ filter: 'drop-shadow(0 2px 8px #f59e42)' }}>
                        <path d="M7 2v2H3v2c0 3.31 2.69 6 6 6h1v3H8v2h8v-2h-2v-3h1c3.31 0 6-2.69 6-6V4h-4V2H7zm10 4c0 2.21-1.79 4-4 4h-2c-2.21 0-4-1.79-4-4V4h10v2z"/>
                      </svg>
                    </span>
                    <div style={{ fontWeight: 700, color: leaderboard[0]?.name === displayName ? '#6366f1' : '#f59e42', fontSize: '1.35rem', marginBottom: '0.2rem', marginTop: '0.5rem' }}>{leaderboard[0]?.name || '-'}</div>
                    <div style={{ color: '#334155', fontSize: '1.15rem' }}>Score: <b>{leaderboard[0]?.score ?? '-'}</b></div>
                    <div style={{ color: leaderboard[0]?.regressions > 0 ? '#dc2626' : '#334155', fontSize: '1rem' }}>Reg: {leaderboard[0]?.regressions ?? '-'}</div>
                  </div>
                </div>
                {/* Third Place */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#a3a3a3', fontSize: '1.1rem', marginBottom: '0.5rem' }}>3rd</div>
                  <div style={{ background: 'linear-gradient(180deg,#e0e7ff,#cbd5e1)', borderRadius: '1rem 1rem 0 0', width: '100px', height: '70px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.10)', border: '3px solid #a3a3a3' }}>
                    <div style={{ fontWeight: 700, color: leaderboard[2]?.name === displayName ? '#6366f1' : '#64748b', fontSize: '1.1rem', marginBottom: '0.2rem' }}>{leaderboard[2]?.name || '-'}</div>
                    <div style={{ color: '#334155', fontSize: '1rem' }}>Score: <b>{leaderboard[2]?.score ?? '-'}</b></div>
                    <div style={{ color: leaderboard[2]?.regressions > 0 ? '#dc2626' : '#334155', fontSize: '0.9rem' }}>Reg: {leaderboard[2]?.regressions ?? '-'}</div>
                  </div>
                </div>
              </div>
              {/* List for the rest */}
              <div style={{ width: '100%', marginTop: '1.5rem', background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 12px rgba(99,102,241,0.08)', padding: '1.5rem 1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1.1rem' }}>
                  <thead>
                    <tr style={{ background: '#e0e7ff' }}>
                      <th style={{ padding: '0.5rem', borderRadius: '0.5rem 0 0 0.5rem' }}>Rank</th>
                      <th style={{ padding: '0.5rem' }}>Name</th>
                      <th style={{ padding: '0.5rem' }}>Score</th>
                      <th style={{ padding: '0.5rem' }}>Regressions</th>
                      <th style={{ padding: '0.5rem', borderRadius: '0 0.5rem 0.5rem 0' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.slice(3, 10).map((entry, idx) => (
                      <tr key={idx + 3} style={{ background: (idx + 3) % 2 === 0 ? '#f1f5f9' : '#fff' }}>
                        <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 4}</td>
                        <td style={{ padding: '0.5rem', fontWeight: entry.name === displayName ? 700 : 400, color: entry.name === displayName ? '#6366f1' : '#334155', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{entry.name}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>{entry.score}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center', color: entry.regressions > 0 ? '#dc2626' : '#334155' }}>{entry.regressions}</td>
                        <td style={{ padding: '0.5rem', fontSize: '0.95rem', color: '#64748b' }}>{new Date(entry.date).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BugSquashGame;
