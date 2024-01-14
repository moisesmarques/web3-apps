import { render, screen } from '@testing-library/react';

import HeaderNFT from './MainHeader';

describe('Header Component', () => {
  test('Render Header', () => {
    render(<HeaderNFT isLogo={true} IsShowNFTContent={true} />);
    const linkElement = screen.getByTestId('mainHeader');
    expect(linkElement).toBeInTheDocument();
  });
});
