import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Calaveras County Grants Portal header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Calaveras County Grants Portal/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders without crashing', () => {
  const div = document.createElement('div');
  render(<App />, div);
});
