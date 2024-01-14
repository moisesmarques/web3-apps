import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';

import store from '@/store/index';
import { queryClient } from '@/utils/queryClient';

import NftList from './index';

test('renders NftList Module', () => {
  render(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <NftList />
      </Provider>
    </QueryClientProvider>
  );
  const linkElement = screen.getByText(/My NFTs/i);
  expect(linkElement).toBeInTheDocument();
});
