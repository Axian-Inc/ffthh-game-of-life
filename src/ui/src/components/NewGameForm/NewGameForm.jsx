import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../Input/Input.jsx';
import PlayerForm from '../PlayerForm/PlayerForm.jsx';
import PlayerList from '../PlayerList/PlayerList.jsx';
import Button from '../Button/Button.jsx';
import { validateGameName } from '../../utils/validation.js';
import { generateId } from '../../utils/idGenerator.js';
import styles from './NewGameForm.module.css';

function NewGameForm({ onCreateGame, onCancel }) {
  const [gameName, setGameName] = useState('');
  const [players, setPlayers] = useState([]);
  const [nameTouched, setNameTouched] = useState(false);

  const gameNameError = useMemo(() => validateGameName(gameName), [gameName]);
  const canStart = players.length > 0 && !gameNameError;

  const handleAddPlayer = (player) => {
    setPlayers((prev) => [...prev, { ...player, id: generateId() }]);
  };

  const handleRemovePlayer = (id) => {
    setPlayers((prev) => prev.filter((player) => player.id !== id));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setNameTouched(true);

    if (!canStart) {
      return;
    }

    onCreateGame({
      name: gameName.trim(),
      players,
    });

    setGameName('');
    setPlayers([]);
    setNameTouched(false);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h3>Start a new game</h3>
        <p className={styles.tagline}>Set a name, add players, and get ready to play.</p>
      </div>
      <Input
        label="Game Name"
        placeholder="Family Game Night"
        value={gameName}
        onChange={(event) => setGameName(event.target.value)}
        onBlur={() => setNameTouched(true)}
        error={nameTouched ? gameNameError : ''}
        required
      />
      <PlayerList players={players} onRemovePlayer={handleRemovePlayer} />
      <PlayerForm onAddPlayer={handleAddPlayer} />
      <div className={styles.footer}>
        {players.length === 0 && (
          <span className={styles.helper}>Add at least one player to start</span>
        )}
        <Button type="submit" disabled={!canStart}>
          Start Game ({players.length})
        </Button>
        {onCancel && (
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

NewGameForm.propTypes = {
  onCreateGame: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

export default NewGameForm;
