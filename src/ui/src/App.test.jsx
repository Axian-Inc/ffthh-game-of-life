import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import App from './App.jsx';

test('renders app header', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /game hub/i })).toBeInTheDocument();
});

test('app has no obvious accessibility violations', async () => {
  const { container } = render(<App />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
