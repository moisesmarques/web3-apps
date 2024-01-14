import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import store from '@/store';

import ImportContacts from '.';

describe('Import contacts test cases', () => {
  test('Render import contacts element', () => {
    render(
      <Provider store={store}>
        <ImportContacts />
      </Provider>
    );
    const linkElement = screen.getByTestId('import-contacts-modal');
    expect(linkElement).toBeInTheDocument();
  });

  test('Cancel import', () => {
    render(
      <Provider store={store}>
        <ImportContacts />
      </Provider>
    );
    const cancelImportButton = screen.getByText('Cancel Import');
    expect(cancelImportButton).toBeInTheDocument();
    fireEvent.click(cancelImportButton);
  });
});
