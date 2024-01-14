export type Wallet = {
  walletName: string;
  isLoading: boolean;
  error: boolean;
};

export type WalletState = {
  userId: string;
  walletName: string;
  blockchainHash: string;
  walletIconUrl: string;
  publicKey: string;
  isPrimary: boolean;
  status: string;
  balance: string;
  blockchainExplorerUrl: string;
  created: string;
};

export interface ICreateWalletServiceRequestProps {
  walletName: string;
  userId?: string;
  email: string;
  phone: string;
}

export interface ICreateWalletServiceResponse {
  isLoading: boolean;
  wallet: {
    userId: string;
    walletName: string;
    blockchainHash: string;
    walletIconUrl: string;
    publicKey: string;
    isPrimary: boolean;
    status: string;
    balance: string;
    blockchainExplorerUrl: string;
    created: string;
  };
}
