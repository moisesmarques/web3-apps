import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';

import store from '@/store';

import LoginFrom from './index';
import { mockNextUseRouter } from '@/mocks/useRouter';

describe('Login Form', () => {
  mockNextUseRouter('/');
  beforeEach(() => {
    render(
      <Provider store={store}>
        <LoginFrom />
      </Provider>
    );
  });

  test('it should render login form', () => {
    const linkElement = screen.getByTestId('login-form');
    expect(linkElement).toBeInTheDocument();
  });

  test('it should have input field for account id', () => {
    const inputField = screen.getByTestId('account-id-input');
    expect(inputField).toBeInTheDocument();
  });

  test('it should contain allow and deny button', async () => {
    const denyButton = screen.getByTestId('login-deny');
    expect(denyButton).toBeInTheDocument();

    const allowButton = screen.getByTestId('login-allow');
    expect(allowButton).toBeInTheDocument();
  });
});
