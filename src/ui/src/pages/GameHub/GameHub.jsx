import { useEffect, useState } from 'react';
import Header from '../../components/Header/Header.jsx';
import Button from '../../components/Button/Button.jsx';
import GameList from '../../components/GameList/GameList.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import NewGameForm from '../../components/NewGameForm/NewGameForm.jsx';
import styles from './GameHub.module.css';

const STORAGE_KEY = 'gameHubGames';

const createId = () => {
  if (globalThis.crypto && globalThis.crypto.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

function GameHub() {
  const [games, setGames] = useState([]);
  const [showNewGame, setShowNewGame] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setGames(parsed);
        }
      }
    } catch (error) {
      setGames([]);
    }
  }, []);

  const handleCreateGame = (game) => {
    const now = new Date().toISOString();
    const nextGame = {
      id: createId(),
      name: game.name,
      players: game.players,
      status: 'active',
      createdAt: now,
      lastActive: now,
    };
    const nextGames = [nextGame, ...games];
    setGames(nextGames);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextGames));
    } catch (error) {
      // Ignore storage errors for now.
    }
    setShowNewGame(false);
  };

  return (
    <main className={styles.page}>
      <Header />
      <div className={styles.actions}>
        <Button onClick={() => setShowNewGame(true)}>+ New Game</Button>
      </div>
      <GameList games={games} onResumeGame={() => {}} onDeleteGame={() => {}} />
      <Modal isOpen={showNewGame} onClose={() => setShowNewGame(false)} title="New Game">
        <NewGameForm onCreateGame={handleCreateGame} onCancel={() => setShowNewGame(false)} />
      </Modal>
    </main>
  );
}

export default GameHub;
