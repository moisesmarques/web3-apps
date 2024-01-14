import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';

import store from '@/store';

import Footer from './index';

describe('Verification Account Footer', () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <Footer type="phone number" />
      </Provider>
    );
  });

  test('it should have paragraph with some text', () => {
    expect(screen.getByTestId('code-text')).toBeInTheDocument();
    expect(screen.getByTestId('code-text')).toHaveTextContent("Didn't receive your code?");
  });

  test('it should have resend code text', () => {
    expect(screen.getByTestId('resend-code')).toBeInTheDocument();
  });
});
