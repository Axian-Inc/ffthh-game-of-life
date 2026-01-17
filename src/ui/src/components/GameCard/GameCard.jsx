import PropTypes from 'prop-types';
import Avatar from '../Avatar/Avatar.jsx';
import Button from '../Button/Button.jsx';
import styles from './GameCard.module.css';

const MAX_AVATARS = 5;

const formatTimestamp = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

function GameCard({ game, onResume, onDelete }) {
  const { name, players, lastActive, status } = game;
  const visiblePlayers = players.slice(0, MAX_AVATARS);
  const extraCount = players.length - visiblePlayers.length;

  return (
    <article className={styles.card}>
      <div className={styles.headerRow}>
        <div>
          <h3 className={styles.title}>{name}</h3>
          <div className={styles.meta}>
            <span className={styles.metaItem}>👥 {players.length} players</span>
            <span className={styles.metaItem}>⏱ {formatTimestamp(lastActive)}</span>
          </div>
        </div>
        <span className={styles.badge}>{status}</span>
      </div>

      <div className={styles.avatars}>
        {visiblePlayers.map((player) => (
          <Avatar key={player.id} emoji={player.avatar} size="small" />
        ))}
        {extraCount > 0 && <span className={styles.extraCount}>+{extraCount}</span>}
      </div>

      <div className={styles.actions}>
        <Button onClick={() => onResume(game)}>Resume</Button>
        <button
          type="button"
          className={styles.deleteButton}
          aria-label="Delete game"
          onClick={() => onDelete(game)}
        >
          🗑
        </button>
      </div>
    </article>
  );
}

GameCard.propTypes = {
  game: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    players: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        avatar: PropTypes.string.isRequired,
      })
    ).isRequired,
    lastActive: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]).isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onResume: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default GameCard;
