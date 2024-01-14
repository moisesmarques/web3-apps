import { screen, render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';

import store from '@/store';

import CreateNFT from './CreateNFT';

const props = {
  open: true,
  title: 'Create an NFT',
};

describe('Single NFT', () => {
  const handleClose = jest.fn();
  const { nftDetails } = store.getState();
  const { allNfts } = nftDetails;

  const closeButton = screen.queryByTestId('close-button');

  beforeAll(() => {
    render(
      <Provider store={store}>
        <CreateNFT {...props} handleClose={handleClose} />
      </Provider>
    );
  });

  it('should render Create NFT Modal', () => {
    const createNFTTitle = screen.getByText(/Create an NFT/);
    expect(createNFTTitle).toBeInTheDocument();
  });

  it('should only display close button if there are NFTs minted', () => {
    if (allNfts && allNfts.length > 0) {
      expect(closeButton).toBeInTheDocument();
    } else {
      expect(closeButton).toBeNull();
    }
  });

  it('should close the Create NFT Modal', () => {
    if (allNfts && allNfts.length > 0) {
      if (closeButton) fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    } else {
      expect(closeButton).toBeNull();
    }
  });
});
