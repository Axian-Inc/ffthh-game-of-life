import PropTypes from 'prop-types';
import Avatar from '../Avatar/Avatar.jsx';
import { getNextAvatar } from '../../utils/avatars.js';
import styles from './AvatarPicker.module.css';

function AvatarPicker({ selectedAvatar, onAvatarChange }) {
  const handleShuffle = () => {
    const next = getNextAvatar(selectedAvatar);
    onAvatarChange(next);
  };

  return (
    <div className={styles.picker}>
      <button type="button" className={styles.button} onClick={handleShuffle}>
        <Avatar emoji={selectedAvatar} size="large" ariaLabel="Selected avatar" />
      </button>
      <span className={styles.hint}>Click to shuffle avatar</span>
    </div>
  );
}

AvatarPicker.propTypes = {
  selectedAvatar: PropTypes.string.isRequired,
  onAvatarChange: PropTypes.func.isRequired,
};

export default AvatarPicker;
