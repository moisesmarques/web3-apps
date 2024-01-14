import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import { ITransaction } from '@/components/TransactionItem/TransactionItem.type';

import TransactionItem from './TransactionItem';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'NFT Transactions',
  component: TransactionItem,
} as ComponentMeta<typeof TransactionItem>;

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

export const NftTransactionItem: ComponentStory<typeof TransactionItem> = (args) => <TransactionItem {...args} />;

NftTransactionItem.args = {
  item,
};
