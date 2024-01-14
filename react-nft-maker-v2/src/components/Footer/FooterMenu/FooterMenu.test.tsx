import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';

import store from '@/store';

import FooterMenu from './FooterMenu';

describe('Footer Menu Component', () => {
  const handleToggle = jest.fn();
  let footerMenu: HTMLElement | null = null;

  beforeAll(() => {
    render(
      <Provider store={store}>
        <FooterMenu toggleActive={handleToggle}>
          <h1>Testing</h1>
        </FooterMenu>
      </Provider>
    );

    footerMenu = screen.getByTestId('footerMenu');
  });

  test('Render Footer Menu', () => {
    expect(footerMenu).toBeInTheDocument();
  });
});
