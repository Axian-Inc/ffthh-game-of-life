const avatars = [
  '🦁', '👨', '👩', '🐶', '🐱', '🐸', '🦊', '🐻',
  '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵',
  '🦉', '🦆', '🦅', '🦋', '🐝', '🐞', '🦗', '🐢',
];

const getNextAvatar = (current) => {
  const options = avatars.filter((emoji) => emoji !== current);
  if (options.length === 0) {
    return current;
  }
  const index = Math.floor(Math.random() * options.length);
  return options[index];
};

export { avatars, getNextAvatar };
