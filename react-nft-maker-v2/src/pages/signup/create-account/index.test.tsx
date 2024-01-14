import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import '@testing-library/jest-dom';
import store from '@/store';

import CreateAccount from './index.page';
import { mockNextUseRouter } from '@/mocks/useRouter';

mockNextUseRouter('/');
describe('Create Account Up Page', () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <CreateAccount />
      </Provider>
    );
  });

  test('it should render create account page', () => {
    const linkElement = screen.getByTestId('create-account-container');
    expect(linkElement).toBeInTheDocument();
  });

  test('it should have heading with text Create an NFT account', () => {
    const headingElement = screen.getByTestId('create-account-heading');
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveTextContent('Create an NFT account');
  });
});
