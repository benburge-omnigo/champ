import React, { useState, useRef, useEffect } from 'react';
import './BugSquashGame.css';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 300;
const BUG_SIZE = 40;
const BUG_COUNT = 5;
const GAME_TIME = 20; // seconds

function getRandomPosition() {
  return {
    left: Math.random() * (GAME_WIDTH - BUG_SIZE),
    top: Math.random() * (GAME_HEIGHT - BUG_SIZE),
  };
}

const BugSquashGame: React.FC = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [bugs, setBugs] = useState(Array.from({ length: BUG_COUNT }, getRandomPosition));
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Move bugs every 1s
  useEffect(() => {
    if (!running) return;
    const moveInterval = setInterval(() => {
      setBugs(bugs => bugs.map(() => getRandomPosition()));
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
    setTimeLeft(GAME_TIME);
    setBugs(Array.from({ length: BUG_COUNT }, getRandomPosition));
    setRunning(true);
  };

  // Squash bug
  const squashBug = (idx: number) => {
    if (!running) return;
    setScore(s => s + 1);
    setBugs(bugs => bugs.map((bug, i) => (i === idx ? getRandomPosition() : bug)));
  };

  return (
    <div className="bug-squash-container">
      <h2>Bug Squash Game</h2>
      <div className="bug-squash-info">
        <span>Score: <b>{score}</b></span>
        <span>Time: <b>{timeLeft}</b>s</span>
      </div>
      <button className="bug-squash-start" onClick={startGame} disabled={running}>
        {running ? 'Game Running...' : 'Start Game'}
      </button>
      <div className="bug-squash-game-area" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        {bugs.map((bug, idx) => (
          <div
            key={idx}
            className="bug-squash-bug"
            style={{ left: bug.left, top: bug.top, width: BUG_SIZE, height: BUG_SIZE }}
            onClick={() => squashBug(idx)}
          />
        ))}
        {!running && timeLeft !== GAME_TIME && (
          <div className="bug-squash-end">
            <h3>Game Over!</h3>
            <p>Your final score: <b>{score}</b></p>
            <p>🎉 Omnigo Champion! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BugSquashGame;
