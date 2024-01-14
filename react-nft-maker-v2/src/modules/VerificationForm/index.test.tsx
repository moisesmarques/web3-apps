import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';

import store from '@/store';

import VerificationForm from './index';

describe('Verification Form', () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <VerificationForm />
      </Provider>
    );
  });

  test('it should render verification form', () => {
    const linkElement = screen.getByTestId('verification-form');
    expect(linkElement).toBeInTheDocument();
  });

  test('it should have button with text Continue', () => {
    const continueButton = screen.getByTestId('continue-button');
    expect(continueButton).toBeInTheDocument();
    expect(continueButton).toHaveTextContent('Continue');
  });
});
