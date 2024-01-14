import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';

import { TYPE_FILTERS } from '@/constants/filters';

import Filter from './index';

const props = {
  handleChange: jest.fn(),
  open: true,
};

test('renders filter dropdown', () => {
  render(<Filter filters={TYPE_FILTERS} value={['Digital Arts']} label="label" />);
  const linkElement = screen.getByText(/Digital Arts/i);
  expect(linkElement).toBeInTheDocument();
});

test('Select option from filters dropdown', () => {
  const { getByRole } = render(<Filter filters={TYPE_FILTERS} value={['Digital Arts']} label="label" {...props} />);

  const item = getByRole('option', { name: 'Technology' });
  expect(item).toBeInTheDocument();
  fireEvent.click(item);
  expect(props.handleChange).toHaveBeenCalledTimes(1);
});
