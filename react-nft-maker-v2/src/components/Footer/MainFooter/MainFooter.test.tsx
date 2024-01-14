import { render, screen } from '@testing-library/react';

import FooterNFT from './MainFooter';

describe('Footer Component', () => {
  test('Render Footer', () => {
    render(<FooterNFT />);
    const linkElement = screen.getByTestId('mainFooter');
    expect(linkElement).toBeInTheDocument();
  });
});
