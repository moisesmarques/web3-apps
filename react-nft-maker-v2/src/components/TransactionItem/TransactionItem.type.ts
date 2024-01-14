/**
 * @param senderId sender is
 * @param senderName sender name
 * @param recipientId recipient id
 * @param recipientName recipient name
 * @param transactionId transaction id
 * @param type transaction type
 * @param transactionItemId transaction item id
 * @param blockchainStatus status of blockchain
 * @param transactionValue value of transaction
 * @param status status of transaction
 * @param created created time
 * @param updated upldated time
 */
export interface ITransaction {
  updated: number;
  transactionItemId: string;
  receiverWalletId: string;
  senderWalletId: string;
  created: number;
  transactionValue: string;
  transactionId: string;
  transactionHash?: string;
  type: string;
  status?: string;
  blockchainStatus?: string;
  senderWalleId: string;
}
