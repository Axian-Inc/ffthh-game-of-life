import PropTypes from 'prop-types';
import GameCard from '../GameCard/GameCard.jsx';
import styles from './GameList.module.css';

function GameList({ games, onResumeGame, onDeleteGame }) {
  const sortedGames = [...games].sort(
    (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
  );

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleGroup}>
          <span aria-hidden="true">🏆</span>
          <h2 className={styles.title}>Your Games</h2>
        </div>
        <span className={styles.countBadge}>{games.length}</span>
      </div>

      {games.length === 0 ? (
        <div className={styles.empty}>No games yet. Start a new one!</div>
      ) : (
        <div className={styles.grid}>
          {sortedGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onResume={onResumeGame}
              onDelete={onDeleteGame}
            />
          ))}
        </div>
      )}
    </section>
  );
}

GameList.propTypes = {
  games: PropTypes.arrayOf(PropTypes.object).isRequired,
  onResumeGame: PropTypes.func.isRequired,
  onDeleteGame: PropTypes.func.isRequired,
};

export default GameList;
