import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from './ConfirmDialog.jsx';

test('confirmation dialog prevents accidental deletions', async () => {
  const user = userEvent.setup();
  const handleConfirm = jest.fn();
  const handleCancel = jest.fn();

  render(
    <ConfirmDialog
      isOpen
      title="Delete"
      message="Confirm?"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  await user.click(screen.getByRole('button', { name: /cancel/i }));
  expect(handleCancel).toHaveBeenCalledTimes(1);
  expect(handleConfirm).not.toHaveBeenCalled();

  await user.click(screen.getByRole('button', { name: /confirm/i }));
  expect(handleConfirm).toHaveBeenCalledTimes(1);
});
