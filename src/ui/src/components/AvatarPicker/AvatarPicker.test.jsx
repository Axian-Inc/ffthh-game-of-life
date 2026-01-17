import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AvatarPicker from './AvatarPicker.jsx';

const originalRandom = Math.random;

afterEach(() => {
  Math.random = originalRandom;
});

test('initial avatar displayed', () => {
  render(<AvatarPicker selectedAvatar="🦁" onAvatarChange={() => {}} />);
  expect(screen.getByLabelText(/selected avatar/i)).toHaveTextContent('🦁');
});

test('clicking shuffles to different avatar', async () => {
  Math.random = () => 0;
  const user = userEvent.setup();
  const handleChange = jest.fn();
  render(<AvatarPicker selectedAvatar="🦁" onAvatarChange={handleChange} />);

  await user.click(screen.getByRole('button'));
  expect(handleChange).toHaveBeenCalled();
  expect(handleChange).not.toHaveBeenCalledWith('🦁');
});

test('never shows same avatar twice in a row', async () => {
  Math.random = () => 0;
  const user = userEvent.setup();
  const handleChange = jest.fn();
  render(<AvatarPicker selectedAvatar="🦁" onAvatarChange={handleChange} />);

  await user.click(screen.getByRole('button'));
  const next = handleChange.mock.calls[0][0];
  expect(next).not.toBe('🦁');
});
