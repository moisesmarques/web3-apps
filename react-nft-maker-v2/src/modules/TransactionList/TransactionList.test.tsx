import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';

import '@testing-library/jest-dom';

import store from '@/store/index';
import { queryClient } from '@/utils/queryClient';

import TransactionList from './index';

test('renders transactions list Module', () => {
  render(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <TransactionList />
      </Provider>
    </QueryClientProvider>
  );
  const linkElement = screen.getByTestId('transactions');
  expect(linkElement).toBeInTheDocument();
});
