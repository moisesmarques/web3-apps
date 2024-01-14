import { screen, render } from '@testing-library/react';
import { Provider } from 'react-redux';

import store from '@/store';

import SendNft from '.';

describe('Send NFT', () => {
  it('should render Send NFT Modal', () => {
    beforeEach(() => {
      render(
        <Provider store={store}>
          <SendNft handleClose={() => {}} />
        </Provider>
      );
    });

    const createNFTTitle = screen.getByText(/Send NFT/);
    expect(createNFTTitle).toBeInTheDocument();

    const createNFTButton = screen.getByText(/Select an NFT you want to add/);
    expect(createNFTButton).toBeInTheDocument();
  });
});
