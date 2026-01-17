import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from './Toast.jsx';

test('toast displays message and dismisses', async () => {
  const user = userEvent.setup();
  const handleDismiss = jest.fn();
  render(<Toast message="Saved" type="success" onDismiss={handleDismiss} />);

  expect(screen.getByText(/saved/i)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /dismiss/i }));
  expect(handleDismiss).toHaveBeenCalledTimes(1);
});

test('error toast uses alert role', () => {
  render(<Toast message="Oops" type="error" onDismiss={() => {}} />);
  expect(screen.getByRole('alert')).toBeInTheDocument();
});
