import React, { useState, useRef, useEffect } from 'react';
import './BugSquashGame.css';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 300;

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

const BugSquashGame: React.FC = () => {


  const [score, setScore] = useState(0);
  const [regressions, setRegressions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [bugs, setBugs] = useState(Array.from({ length: BUG_COUNT }, getRandomBugPosition));
  const [codes, setCodes] = useState(Array.from({ length: CODE_COUNT }, getRandomCodePosition));
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);


  // Move bugs and code every 1s
  useEffect(() => {
    if (!running) return;
    const moveInterval = setInterval(() => {
      setBugs(bugs => bugs.map(() => getRandomBugPosition()));
      setCodes(codes => codes.map(() => getRandomCodePosition()));
    }, 1000);
    return () => clearInterval(moveInterval);
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



  // Reset game
  const startGame = () => {
    setScore(0);
    setRegressions(0);
    setTimeLeft(GAME_TIME);
    setBugs(Array.from({ length: BUG_COUNT }, getRandomBugPosition));
    setCodes(Array.from({ length: CODE_COUNT }, getRandomCodePosition));
    setRunning(true);
  };


  // Squash bug
  const squashBug = (idx: number) => {
    if (!running) return;
    setScore(s => s + 1);
    setBugs(bugs => bugs.map((bug, i) => (i === idx ? getRandomBugPosition() : bug)));
  };


  // Click code block (penalty)
  const hitCode = (idx: number) => {
    if (!running) return;
    setScore(s => (s > 0 ? s - 1 : 0));
    setRegressions(r => r + 1);
    setCodes(codes => codes.map((code, i) => (i === idx ? getRandomCodePosition() : code)));
  };

  return (
    <div className="bug-squash-container">
      <h2>Bug Squash Game</h2>
      <div className="bug-squash-info">
        <span>Bugs Fixed: <b>{score}</b></span>
        <span>Regressions: <b style={{ color: regressions > 0 ? '#dc2626' : '#334155' }}>{regressions}</b></span>
        <span>Time: <b>{timeLeft}</b>s</span>
      </div>
      <button className="bug-squash-start" onClick={startGame} disabled={running}>
        {running ? 'Game Running...' : 'Start Game'}
      </button>
      <div className="bug-squash-game-area" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        {/* Bugs */}
        {bugs.map((bug, idx) => (
          <div
            key={"bug-" + idx}
            className="bug-squash-bug"
            style={{ left: bug.left, top: bug.top, width: BUG_SIZE, height: BUG_SIZE }}
            onClick={() => squashBug(idx)}
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
    </div>
  );
};

export default BugSquashGame;
