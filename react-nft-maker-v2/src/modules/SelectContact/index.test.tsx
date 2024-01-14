import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import store from '@/store';

import ImportContacts from '.';

describe('Select contacts test cases', () => {
  test('Render select contacts element', () => {
    render(
      <Provider store={store}>
        <ImportContacts />
      </Provider>
    );
    const linkElement = screen.getByTestId('select-contacts-modal');
    expect(linkElement).toBeInTheDocument();
  });

  test('Send Nfts', () => {
    render(
      <Provider store={store}>
        <ImportContacts />
      </Provider>
    );
    const sendNFTButton = screen.getByText('Import');
    expect(sendNFTButton).toBeInTheDocument();
    fireEvent.click(sendNFTButton);
  });
});
