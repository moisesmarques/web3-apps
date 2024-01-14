import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';

import store from '@/store';

import CreateAccount from './index';

describe('Create Account Form', () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <CreateAccount />
      </Provider>
    );
  });

  test('it should render create account form', () => {
    const linkElement = screen.getByTestId('create-account-form');
    expect(linkElement).toBeInTheDocument();
  });

  test('it should have label with name Full Name', () => {
    const inputField = screen.getByText('Full Name');
    expect(inputField).toBeInTheDocument();
  });
});
