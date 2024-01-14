import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import store from '@/store';

import CreateContact from '.';

describe('Add contact test cases', () => {
  test('Render add contact element', () => {
    render(
      <Provider store={store}>
        <CreateContact />
      </Provider>
    );
    const linkElement = screen.getByTestId('add-contacts-modal');
    expect(linkElement).toBeInTheDocument();
  });

  test('Save contact', () => {
    render(
      <Provider store={store}>
        <CreateContact />
      </Provider>
    );
    const saveContactButton = screen.getByText('Save');
    expect(saveContactButton).toBeInTheDocument();
    fireEvent.click(saveContactButton);
  });
});
