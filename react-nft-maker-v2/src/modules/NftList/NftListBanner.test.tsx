import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import NftListBanner from './NftListBanner';

test(`renders NftList Banner's title`, () => {
  render(<NftListBanner />);
  const title = screen.getByText(/Start Creating your/i);
  expect(title).toBeInTheDocument();
});

test(`renders NftList Banner's button`, () => {
  render(<NftListBanner />);
  const button = screen.getByText(/Mint an NFT/i);
  expect(button).toBeInTheDocument();
});
