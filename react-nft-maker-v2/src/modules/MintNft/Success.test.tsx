import { render, screen } from '@testing-library/react';

import Preview from './Success';

describe('NTF Create Success test cases', () => {
  beforeEach(() => {
    render(<Preview changeStep={() => {}} setModalState={() => {}} />);
  });

  test('Render NFT Preview Component', () => {
    const linkElement = screen.getByTestId('previewNftCreate');
    expect(linkElement).toBeInTheDocument();
  });

  test('Sucessfully minted text present', () => {
    const successText = screen.getByText(/Successfully Minted/i);
    expect(successText).toBeInTheDocument();
  });

  test('Open button text present', () => {
    const openButton = screen.getByText(/Open/i);
    expect(openButton).toBeInTheDocument();
  });
});
