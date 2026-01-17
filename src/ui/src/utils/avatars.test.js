import { avatars, getNextAvatar } from './avatars.js';

test('getNextAvatar returns a different value when options exist', () => {
  const next = getNextAvatar('A');
  expect(next).not.toBe('A');
});

test('getNextAvatar returns current when no alternatives exist', () => {
  const original = avatars.slice();
  avatars.length = 0;
  avatars.push('A');

  try {
    expect(getNextAvatar('A')).toBe('A');
  } finally {
    avatars.length = 0;
    avatars.push(...original);
  }
});
