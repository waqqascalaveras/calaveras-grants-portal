
import { render } from '@testing-library/react';
import App from './App';

jest.mock('./components/CalaverrasGrantsDashboard', () => () => <div />);
jest.mock('./components/UserTypeSelector', () => () => <div />);
jest.mock('./components/DepartmentSelector', () => () => <div />);

test('renders without crashing', () => {
  render(<App />);
});
