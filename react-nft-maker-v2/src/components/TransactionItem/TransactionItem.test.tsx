import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import TransactionItem from './index';
import { ITransaction } from './TransactionItem.type';

test('renders transaction item component', () => {
  const item: ITransaction = {
    transactionId: 'transactionId',
    receiverWalletId: 'c8QeismpmJ5hPEmvd9SO7',
    senderWalletId: 'hcouLvmnUzB6pyEyExLCW',
    type: 'unclaimed',
    transactionItemId: 'transactionItemId',
    blockchainStatus: 'blockchainStatus',
    transactionValue: 'transactionValue',
    status: 'status',
    created: 43424242,
    updated: 23424234,
    senderWalleId: 'hcouLvmnUzB6pyEyExLCW',
  };
  render(<TransactionItem item={item} />);
  const linkElement = screen.getByText(/Sent to/i);
  expect(linkElement).toBeInTheDocument();
});
