import { render, screen } from '@testing-library/react';

import Preview from './Open';

describe('NTF Create Open test cases', () => {
  beforeEach(() => {
    render(<Preview changeStep={() => {}} setModalState={() => {}} />);
  });

  test('Render NFT Preview Component', () => {
    const linkElement = screen.getByTestId('openNftCreate');
    expect(linkElement).toBeInTheDocument();
  });

  test('Send NFT button text present', () => {
    const sendNftButton = screen.getByText(/Send Nft /i);
    expect(sendNftButton).toBeInTheDocument();
  });
});
