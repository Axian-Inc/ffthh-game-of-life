import PropTypes from 'prop-types';
import styles from './Toast.module.css';

function Toast({ message, type = 'info', onDismiss }) {
  return (
    <div className={`${styles.toast} ${styles[type]}`} role={type === 'error' ? 'alert' : 'status'}>
      <span className={styles.message}>{message}</span>
      <button type="button" className={styles.close} onClick={onDismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info']),
  onDismiss: PropTypes.func.isRequired,
};

export default Toast;
