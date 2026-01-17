import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal.jsx';

test('renders when isOpen is true', () => {
  render(
    <Modal isOpen onClose={() => {}} title="Hello">
      <p>Content</p>
    </Modal>
  );
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText(/content/i)).toBeInTheDocument();
});

test('does not render when isOpen is false', () => {
  render(
    <Modal isOpen={false} onClose={() => {}} title="Hello">
      <p>Content</p>
    </Modal>
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('calls onClose when backdrop clicked', async () => {
  const user = userEvent.setup();
  const handleClose = jest.fn();
  render(
    <Modal isOpen onClose={handleClose}>
      <p>Content</p>
    </Modal>
  );

  await user.click(screen.getByTestId('modal-overlay'));
  expect(handleClose).toHaveBeenCalledTimes(1);
});

test('calls onClose when ESC pressed', async () => {
  const user = userEvent.setup();
  const handleClose = jest.fn();
  render(
    <Modal isOpen onClose={handleClose}>
      <p>Content</p>
    </Modal>
  );

  await user.keyboard('{Escape}');
  expect(handleClose).toHaveBeenCalledTimes(1);
});

test('calls onClose when close button clicked', async () => {
  const user = userEvent.setup();
  const handleClose = jest.fn();
  render(
    <Modal isOpen onClose={handleClose}>
      <p>Content</p>
    </Modal>
  );

  await user.click(screen.getByRole('button', { name: /close modal/i }));
  expect(handleClose).toHaveBeenCalledTimes(1);
});

test('locks body scroll when modal open', () => {
  render(
    <Modal isOpen onClose={() => {}}>
      <p>Content</p>
    </Modal>
  );
  expect(document.body.style.overflow).toBe('hidden');
});

test('keeps focus on modal when tabbing with no focusables', () => {
  render(
    <Modal isOpen onClose={() => {}} showCloseButton={false}>
      <p>Content</p>
    </Modal>
  );
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveFocus();

  fireEvent.keyDown(document, { key: 'Tab' });
  expect(dialog).toHaveFocus();
});

test('wraps focus between first and last focusable elements', () => {
  render(
    <Modal isOpen onClose={() => {}} showCloseButton={false}>
      <button type="button">First</button>
      <button type="button">Last</button>
    </Modal>
  );

  const [first, last] = screen.getAllByRole('button');
  first.focus();
  fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
  expect(last).toHaveFocus();

  last.focus();
  fireEvent.keyDown(document, { key: 'Tab' });
  expect(first).toHaveFocus();
});
