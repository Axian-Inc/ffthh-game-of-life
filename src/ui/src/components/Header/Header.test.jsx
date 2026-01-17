import { render, screen } from '@testing-library/react';
import Header from './Header.jsx';

test('renders header elements', () => {
  render(<Header />);
  expect(screen.getByRole('heading', { level: 1, name: /game hub/i })).toBeInTheDocument();
  expect(screen.getByText(/family fun starts here/i)).toBeInTheDocument();
  expect(screen.getByAltText(/game controller/i)).toBeInTheDocument();
});

test('icon wrapper has gradient class', () => {
  const { container } = render(<Header />);
  const iconWrap = container.querySelector('div');
  expect(iconWrap.className).toMatch(/iconWrap/);
});
