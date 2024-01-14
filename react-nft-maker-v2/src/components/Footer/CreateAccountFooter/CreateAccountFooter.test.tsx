import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import Footer from './index';

describe('Create Account Footer', () => {
  beforeEach(() => {
    render(<Footer />);
  });

  test('it should have login button', () => {
    const loginButton = screen.getByTestId('login-create-account');
    expect(loginButton).toBeInTheDocument();
  });
});
