export interface ITransactionData {
  updated: number;
  transactionItemId: string;
  receiverWalletId: string;
  senderWalletId: string;
  created: number;
  transactionValue: string;
  transactionId: string;
  type: string;
  status?: string;
  blockchainStatus: string;
  senderWalleId: string;
}

export interface ITransactionsStore {
  allTransactions: [];
}
