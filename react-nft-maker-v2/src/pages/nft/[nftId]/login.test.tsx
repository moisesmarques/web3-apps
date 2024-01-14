import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';

import store from '@/store';

import Login from './index.page';
import { mockNextUseRouter } from '@/mocks/useRouter';

describe('Authentication Page', () => {
  mockNextUseRouter('/');
  beforeEach(() => {
    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );
  });

  test('it should render login page', () => {
    const loginContainer = screen.getByTestId('login-container');
    expect(loginContainer).toBeInTheDocument();
  });

  test('it should have heading with text Verification', () => {
    const headingElement = screen.getByTestId('heading');
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveTextContent('Login with your NEARApps ID');
  });
});
