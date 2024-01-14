import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import Footer from './index';

describe('Sign Up Footer', () => {
  beforeEach(() => {
    render(<Footer />);
  });

  test('it should have login button', () => {
    const loginButton = screen.getByTestId('login-create-account');
    expect(loginButton).toBeInTheDocument();
  });

  test('it should have paragraph with some text', () => {
    expect(screen.getByTestId('footer-text-login')).toBeInTheDocument();
    expect(screen.getByTestId('footer-text-login')).toHaveTextContent('Already have Near Account?');
  });
});
