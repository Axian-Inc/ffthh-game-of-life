import PropTypes from 'prop-types';
import styles from './Avatar.module.css';

const sizeClasses = {
  small: styles.small,
  medium: styles.medium,
  large: styles.large,
};

function Avatar({ emoji = '🙂', size = 'medium', onClick, ariaLabel }) {
  const className = [
    styles.avatar,
    sizeClasses[size],
    onClick ? styles.clickable : '',
  ]
    .filter(Boolean)
    .join(' ');

  const label = ariaLabel || `Avatar ${emoji}`;

  if (onClick) {
    return (
      <button
        type="button"
        className={`${styles.buttonReset} ${className}`}
        onClick={onClick}
        aria-label={label}
      >
        <span aria-hidden="true">{emoji}</span>
      </button>
    );
  }

  return (
    <div className={className} role="img" aria-label={label}>
      <span aria-hidden="true">{emoji}</span>
    </div>
  );
}

Avatar.propTypes = {
  emoji: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onClick: PropTypes.func,
  ariaLabel: PropTypes.string,
};

export default Avatar;
