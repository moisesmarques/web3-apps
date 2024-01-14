import { render, screen } from '@testing-library/react';

import Preview from './Preview';

describe('NTF Create Preview test cases', () => {
  beforeEach(() => {
    render(<Preview changeStep={() => {}} setModalState={() => {}} />);
  });

  test('Render NFT Preview Component', () => {
    const linkElement = screen.getByTestId('previewNftCreate');
    expect(linkElement).toBeInTheDocument();
  });

  test('Creat NFT button present', () => {
    const createNFTButton = screen.getByText('/This is title/');
    expect(createNFTButton).toBeInTheDocument();
  });
});
