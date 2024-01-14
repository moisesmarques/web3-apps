import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import '@testing-library/jest-dom';

import store from '@/store';

import Authenticate from './index.page';
import { mockNextUseRouter } from '@/mocks/useRouter';

describe('Authentication Page', () => {
  mockNextUseRouter('/');
  beforeEach(() => {
    render(
      <Provider store={store}>
        <Authenticate />
      </Provider>
    );
  });

  test('it should render authenticate page', () => {
    const linkElement = screen.getByTestId('authentication-container');
    expect(linkElement).toBeInTheDocument();
  });

  test('it should have heading with text Authentication', () => {
    const headingElement = screen.getByTestId('authentication-heading');
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveTextContent('Authentication');
  });
});
