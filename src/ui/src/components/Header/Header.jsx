import styles from './Header.module.css';
import gamepadIcon from '../../assets/gamepad-icon.svg';

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.iconWrap} aria-hidden="true">
        <img className={styles.icon} src={gamepadIcon} alt="Game controller" />
      </div>
      <div>
        <h1>Game Hub</h1>
        <p className={styles.tagline}>
          Family fun starts here! Create games, add players, and let the good times roll.
        </p>
      </div>
    </header>
  );
}

export default Header;
