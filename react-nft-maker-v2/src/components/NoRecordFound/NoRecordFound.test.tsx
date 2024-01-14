import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import NoRecordFound from './index';

test('renders no record found component', () => {
  render(<NoRecordFound text="Your transactions will appear here" />);
  const linkElement = screen.getByText(/Your transactions will appear here/i);
  expect(linkElement).toBeInTheDocument();
});
