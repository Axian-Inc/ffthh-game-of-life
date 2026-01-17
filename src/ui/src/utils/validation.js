const nicknamePattern = /^[a-zA-Z0-9 ]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateNickname = (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Nickname is required';
  }
  if (trimmed.length < 2 || trimmed.length > 20) {
    return 'Nickname must be 2-20 characters';
  }
  if (!nicknamePattern.test(trimmed)) {
    return 'Nickname can use letters, numbers, and spaces only';
  }
  return '';
};

const validateEmail = (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Email is required';
  }
  if (!emailPattern.test(trimmed)) {
    return 'Enter a valid email address';
  }
  return '';
};

export { validateNickname, validateEmail };
