import PropTypes from 'prop-types';
import Avatar from '../Avatar/Avatar.jsx';
import styles from './PlayerList.module.css';

function PlayerList({ players, onRemovePlayer }) {
  return (
    <section className={styles.container} data-testid="player-list">
      <div className={styles.header}>
        <h3>Players ({players.length})</h3>
        <span className={styles.count}>{players.length}</span>
      </div>

      {players.length === 0 ? (
        <div className={styles.empty}>No players added yet.</div>
      ) : (
        players.map((player) => (
          <div key={player.id} className={styles.player}>
            <div className={styles.info}>
              <Avatar emoji={player.avatar} size="small" />
              <div>
                <div>{player.nickname}</div>
                <div className={styles.email}>{player.email}</div>
              </div>
            </div>
            <button
              type="button"
              className={styles.remove}
              aria-label={`Remove ${player.nickname}`}
              onClick={() => onRemovePlayer(player.id)}
            >
              ✕
            </button>
          </div>
        ))
      )}
    </section>
  );
}

PlayerList.propTypes = {
  players: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      nickname: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired,
    })
  ).isRequired,
  onRemovePlayer: PropTypes.func.isRequired,
};

export default PlayerList;
