import { render, screen } from '@testing-library/react';
import Header from './Header';

test('renders the header', () => {
  render(<Header />);
  // Change the text below to something you expect in your header
  expect(screen.getByText(/excel analytics/i)).toBeInTheDocument();
});