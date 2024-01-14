import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';

import store from '@/store';

import SignUp from './index.page';

describe('Sign Up Page', () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <SignUp />
      </Provider>
    );
  });

  test('it should render signup page', () => {
    const linkElement = screen.getByTestId('signup-container');
    expect(linkElement).toBeInTheDocument();
  });

  test('it should have button with text Email', () => {
    const emailButton = screen.getByTestId('email-button');
    expect(emailButton).toHaveTextContent('Email');
  });

  test('it should have button with text Phone', () => {
    const phoneButton = screen.getByTestId('phone-button');
    expect(phoneButton).toHaveTextContent('Phone');
  });
});
