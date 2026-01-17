import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import AvatarPicker from '../AvatarPicker/AvatarPicker.jsx';
import Input from '../Input/Input.jsx';
import Button from '../Button/Button.jsx';
import { getNextAvatar, avatars } from '../../utils/avatars.js';
import { validateEmail, validateNickname } from '../../utils/validation.js';
import styles from './PlayerForm.module.css';

function PlayerForm({ onAddPlayer }) {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(avatars[0]);
  const [touched, setTouched] = useState({ nickname: false, email: false });

  const nicknameError = useMemo(() => validateNickname(nickname), [nickname]);
  const emailError = useMemo(() => validateEmail(email), [email]);
  const isValid = !nicknameError && !emailError;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isValid) {
      return;
    }

    onAddPlayer({
      nickname: nickname.trim(),
      email: email.trim(),
      avatar,
    });

    setNickname('');
    setEmail('');
    setAvatar(getNextAvatar(avatar));
  };

  const showNicknameError = touched.nickname ? nicknameError : '';
  const showEmailError = touched.email ? emailError : '';

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <AvatarPicker selectedAvatar={avatar} onAvatarChange={setAvatar} />
      <div className={styles.row}>
        <Input
          label="Nickname"
          placeholder="Player nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, nickname: true }))}
          error={showNicknameError}
          required
        />
        <Input
          type="email"
          label="Email"
          placeholder="player@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          error={showEmailError}
          required
        />
      </div>
      <div className={styles.actions}>
        <Button type="submit" disabled={!isValid}>
          Add Player
        </Button>
      </div>
    </form>
  );
}

PlayerForm.propTypes = {
  onAddPlayer: PropTypes.func.isRequired,
};

export default PlayerForm;
