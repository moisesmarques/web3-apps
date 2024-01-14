import { screen, render } from '@testing-library/react';
import { Provider } from 'react-redux';

import store from '@/store';

import SingleNft from './SingleNft';

const props = {
  handleClose: jest.fn(),
  open: true,
};

describe('Single NFT', () => {
  it('should render buttons', () => {
    render(
      <Provider store={store}>
        <SingleNft {...props} />
      </Provider>
    );

    const sendNftButton = screen.getByText(/Send NFT/);
    expect(sendNftButton).toBeInTheDocument();

    const cancelButton = screen.getByText(/Cancel/);
    expect(cancelButton).toBeInTheDocument();
  });
});

// import store from '@/store';
// import { Provider } from 'react-redux';
