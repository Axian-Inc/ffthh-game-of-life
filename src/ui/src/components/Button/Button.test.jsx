import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button.jsx';

test('renders with correct text', () => {
  render(<Button>Play</Button>);
  expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
});

test('fires onClick when clicked', async () => {
  const user = userEvent.setup();
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Start</Button>);

  await user.click(screen.getByRole('button', { name: /start/i }));
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('does not fire onClick when disabled', async () => {
  const user = userEvent.setup();
  const handleClick = jest.fn();
  render(
    <Button disabled onClick={handleClick}>
      Disabled
    </Button>
  );

  await user.click(screen.getByRole('button', { name: /disabled/i }));
  expect(handleClick).not.toHaveBeenCalled();
});

test('applies variant and size classes', () => {
  render(
    <Button variant="secondary" size="large">
      Resume
    </Button>
  );
  const button = screen.getByRole('button', { name: /resume/i });
  expect(button.className).toMatch(/secondary/);
  expect(button.className).toMatch(/large/);
});

test('is keyboard accessible with Enter and Space', async () => {
  const user = userEvent.setup();
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Key</Button>);
  const button = screen.getByRole('button', { name: /key/i });

  button.focus();
  await user.keyboard('{Enter}');
  await user.keyboard(' ');

  expect(handleClick).toHaveBeenCalledTimes(2);
});

test('renders icon when provided', () => {
  render(
    <Button icon={<span data-testid="icon">★</span>}>
      Icon
    </Button>
  );
  expect(screen.getByTestId('icon')).toBeInTheDocument();
});
