import { render, screen } from '@testing-library/react';
import App from './App.jsx';

test('renders app header', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /game hub/i })).toBeInTheDocument();
});
