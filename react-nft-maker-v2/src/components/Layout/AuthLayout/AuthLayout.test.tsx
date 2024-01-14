import { render, screen } from '@testing-library/react';

import AuthLayout from '.';

describe('Render Auth Layout Component', () => {
  test('Render Auth', () => {
    render(<AuthLayout>Right Section</AuthLayout>);
    const linkElement = screen.getByTestId('auth-layout-container');
    expect(linkElement).toBeInTheDocument();
  });
});
