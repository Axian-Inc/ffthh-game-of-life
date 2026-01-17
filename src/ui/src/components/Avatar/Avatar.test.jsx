import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Avatar from './Avatar.jsx';

test('renders with provided emoji', () => {
  render(<Avatar emoji="🦁" />);
  expect(screen.getByLabelText(/avatar/i)).toHaveTextContent('🦁');
});

test('applies correct size class', () => {
  render(<Avatar emoji="🐶" size="large" />);
  const avatar = screen.getByRole('img', { name: /avatar/i });
  expect(avatar.className).toMatch(/large/);
});

test('onClick fires when clicked', async () => {
  const user = userEvent.setup();
  const handleClick = jest.fn();
  render(<Avatar emoji="🐱" onClick={handleClick} />);
  await user.click(screen.getByRole('button', { name: /avatar/i }));
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('has accessible label', () => {
  render(<Avatar emoji="🐸" ariaLabel="Frog avatar" />);
  expect(screen.getByRole('img', { name: /frog avatar/i })).toBeInTheDocument();
});
