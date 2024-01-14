import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import Accordion from './index';

test('renders filter dropdown', () => {
  render(<Accordion title={'This is title'}>content</Accordion>);
  const linkElement = screen.getByText(/This is title/i);
  expect(linkElement).toBeInTheDocument();
});
