const listWalletMock = [
  {
    status: 'pending',
    created: '2022-03-28T09:37:47.331Z',
    walletId: 'demo009.near',
    transactionId: 'ehu4p6IxPdFK3ocpglvrd',
    isBlockchainVerified: 'verified',
    kycProvider: 'kyc_provider',
    balance: '0.00',
    publicKey: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    updated: '2022-03-28T09:37:47.331Z',
    walletName: 'demo009.near',
    storageProvider: 'storage_provider',
    userId: 'dvn5T2dvFXp-qdZBNMOiz',
    blockchainHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
];

const transactionMock = {
  operation: 'create_and_mint_nft',
  status: 'complete',
  created: 1648467527699,
  jobId: 'l8xplhmzc6vaenkighod',
  transactionId: 'l8xpLhMZc-6vaenkIgHOD',
  requestParams: '{"senderWalletId":"demo009.near","ownerWalletId":"demo009.near","ownerId":"dvn5T2dvFXp-qdZBNMOiz","type":"create_and_mint_nft","name":"Test 4 from Ashas without token","capacity":"1","appId":"sdtupj5pfbmtpypibaj","actionId":"x14u1ssqo9m8ip07yevn7","media":"hhmjohikakqe45u9jci65","reference":"9ydl8qh36xn5s43hmyur1","deposit":"0.1"}',
  ownerWalletId: 'demo009.near',
  updated: 1648467527699,
  senderWalletId: 'demo009.near',
  appId: 'sdtupj5pfbmtpypibaj',
  blockchainStatus: 'pending',
  type: 'nft_series_create',
  actionId: 'x14u1ssqo9m8ip07yevn7',
};

const contactMock = {
  contactId: '573f98829831a4322746a5693e56fcc4b6479c44cdd29d2cd16977927d3e1021',
  contactStatus: 'invited',
  lastName: 'sjbvlsomqxopx',
  userId: 'dvn5T2dvFXp-qdZBNMOiz',
  isFavorite: false,
  email: [{ type: 'corporative', address: 'mxxeg925@test.com' }],
  jobTitle: 'yhzxamwpl xtdhhpf',
  phone: [{ type: 'mobile', number: '+4328748615' }],
  firstName: 'yuzlhepxlwtp',
};

const myNft = [{
  title: 'Ashas Test 1  Shift 3',
  description: 'test nft from Ashas from Shift 3',
  categoryId: 'XNwyaIOPKkfc1iFngXorm',
  filePath: 'https://www.eathappyproject.com/wp-content/uploads/2020/08/home-decor.jpg',
  tags: ['nft', 'eathappyproject', 'Ashas',
  ],
  ownerWalletId: 'titusWallet.near',
  ownerId: 'RZTiIbxAVfmhVAmdEYclm',
  nftId: 's2fwZUGh8FMbFVvkxjX3m',
  status: 'pending',
  transactionId: 'hgd2U_ECqKMK_7pN-qJAv',
  created: 1646990846334,
  update: 1646990846334,
}];

const contactMock1 = {
  contactId: '573f98829831a4322746a5693e56fcc4b6479c44cdd29d2cd16977927d3e1021',
  contactStatus: 'invited',
  lastName: 'sjbvlsomqxopx',
  isFavorite: false,
  email: [{ type: 'corporative', address: 'mxxeg925@test.com' }],
  jobTitle: 'yhzxamwpl xtdhhpf',
  phone: [{ type: 'mobile', number: '+4328748615' }],
  firstName: 'yuzlhepxlwtp',
};

const response200 = [
  {
    operation: 'create_and_mint_nft',
    status: 'complete',
    created: 1648460311095,
    jobId: 'czoaqyvb3dxrvkmlngn3d',
    transactionId: 'czoaqYVb3DXrVkMLngn3d',
    requestParams: '{"senderWalletId":"demo009.near","ownerWalletId":"demo009.near","ownerId":"dvn5T2dvFXp-qdZBNMOiz","type":"create_and_mint_nft","name":"Test 4 from Ashas without token","capacity":"1","appId":"pw19kco350avmnobizvhb","actionId":"wndf1rmnh76qqzje5fnid","media":"9v6zv235cfdrg4qyhzxt","reference":"7duxi7iau7ylma9xfybh","deposit":"0.1"}',
    ownerWalletId: 'demo009.near',
    updated: 1648460311095,
    senderWalletId: 'demo009.near',
    appId: 'pw19kco350avmnobizvhb',
    blockchainStatus: 'pending',
    type: 'nft_series_create',
    actionId: 'wndf1rmnh76qqzje5fnid',
  },
  {
    operation: 'create_and_mint_nft',
    status: 'complete',
    created: 1648467527699,
    jobId: 'l8xplhmzc6vaenkighod',
    transactionId: 'l8xpLhMZc-6vaenkIgHOD',
    requestParams: '{"senderWalletId":"demo009.near","ownerWalletId":"demo009.near","ownerId":"dvn5T2dvFXp-qdZBNMOiz","type":"create_and_mint_nft","name":"Test 4 from Ashas without token","capacity":"1","appId":"sdtupj5pfbmtpypibaj","actionId":"x14u1ssqo9m8ip07yevn7","media":"hhmjohikakqe45u9jci65","reference":"9ydl8qh36xn5s43hmyur1","deposit":"0.1"}',
    ownerWalletId: 'demo009.near',
    updated: 1648467527699,
    senderWalletId: 'demo009.near',
    appId: 'sdtupj5pfbmtpypibaj',
    blockchainStatus: 'pending',
    type: 'nft_series_create',
    actionId: 'x14u1ssqo9m8ip07yevn7',
  },
];

module.exports = {
  listWalletMock,
  transactionMock,
  response200,
  contactMock,
  contactMock1,
  myNft,
};
