import { useEffect, useState } from 'react';
import Header from '../../components/Header/Header.jsx';
import Button from '../../components/Button/Button.jsx';
import GameList from '../../components/GameList/GameList.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import NewGameForm from '../../components/NewGameForm/NewGameForm.jsx';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx';
import Toast from '../../components/Toast/Toast.jsx';
import useGames from '../../hooks/useGames.js';
import useToast from '../../hooks/useToast.js';
import styles from './GameHub.module.css';

function GameHub() {
  const { games, createGame, deleteGame, updateGame, loading, error } = useGames();
  const { toasts, addToast, removeToast } = useToast();
  const [showNewGame, setShowNewGame] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);

  useEffect(() => {
    if (error) {
      addToast(error, 'error');
    }
  }, [error, addToast]);

  const handleCreateGame = (game) => {
    createGame(game);
    addToast('Game created successfully!', 'success');
    setShowNewGame(false);
  };

  const handleResumeGame = (game) => {
    updateGame(game.id, { status: 'active' });
  };

  const handleDeleteRequest = (game) => {
    setGameToDelete(game);
  };

  const handleConfirmDelete = () => {
    if (!gameToDelete) {
      return;
    }
    deleteGame(gameToDelete.id);
    addToast('Game deleted', 'info');
    setGameToDelete(null);
  };

  return (
    <main className={styles.page} id="main-content">
      <Header />
      <div className={styles.actions}>
        <Button onClick={() => setShowNewGame(true)}>+ New Game</Button>
      </div>
      {loading ? (
        <p>Loading games...</p>
      ) : (
        <GameList games={games} onResumeGame={handleResumeGame} onDeleteGame={handleDeleteRequest} />
      )}
      <Modal isOpen={showNewGame} onClose={() => setShowNewGame(false)} title="New Game">
        <NewGameForm onCreateGame={handleCreateGame} onCancel={() => setShowNewGame(false)} />
      </Modal>
      <ConfirmDialog
        isOpen={Boolean(gameToDelete)}
        title="Delete game"
        message="Are you sure you want to delete this game? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setGameToDelete(null)}
      />
      <div className={styles.toastRegion} aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </main>
  );
}

export default GameHub;
