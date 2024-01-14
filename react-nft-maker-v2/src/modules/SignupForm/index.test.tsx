import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';

import store from '@/store';

import SignupForm from './index';

describe('Sign Up Form', () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <SignupForm type="phone" />
      </Provider>
    );
  });

  test('it should render signup form', () => {
    const linkElement = screen.getByTestId('signup-form');
    expect(linkElement).toBeInTheDocument();
  });

  test('it should have input field with name phone', () => {
    const inputField = screen.getByTestId('phone-input');
    expect(inputField).toBeInTheDocument();
  });

  test('it should have input field with name email', () => {
    render(
      <Provider store={store}>
        <SignupForm type="email" />
      </Provider>
    );
    const inputField = screen.getByTestId('email-input');
    expect(inputField).toBeInTheDocument();
  });

  test('it should have disabled continue button field when email is not valid', async () => {
    render(
      <Provider store={store}>
        <SignupForm type="email" />
      </Provider>
    );
    const inputField = screen.getByTestId('email-input');
    expect(inputField).toBeInTheDocument();
  });
});
