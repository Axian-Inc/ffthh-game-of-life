import { useEffect, useState } from 'react';
import Header from '../../components/Header/Header.jsx';
import Button from '../../components/Button/Button.jsx';
import GameList from '../../components/GameList/GameList.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import NewGameForm from '../../components/NewGameForm/NewGameForm.jsx';
import styles from './GameHub.module.css';

const STORAGE_KEY = 'gameHubGames';

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

  return (
    <main className={styles.page}>
      <Header />
      <div className={styles.actions}>
        <Button onClick={() => setShowNewGame(true)}>+ New Game</Button>
      </div>
      <GameList games={games} onResumeGame={() => {}} onDeleteGame={() => {}} />
      <Modal isOpen={showNewGame} onClose={() => setShowNewGame(false)} title="New Game">
        <NewGameForm onCancel={() => setShowNewGame(false)} />
      </Modal>
    </main>
  );
}

export default GameHub;
