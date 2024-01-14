const jwtMock = {
  lastName: 'Kivite',
  userId: '_BE_Ou5exXqW-wFLuTxud',
  status: 'active',
  created: 1646209318710,
  isPhoneVerified: false,
  email: 'tkivite@gmail.com',
  firstName: 'Titus',
  isEmailVerified: false,
  walletName: 'titusWallet.near',
  walletId: 'titusWallet.near',
  iat: 1646327133,
};
const nft = {
  title: 'Ashas Test 1  Shift 3',
  description: 'test nft from Ashas from Shift 3',
  categoryId: 'XNwyaIOPKkfc1iFngXorm',
  filePath:
    'https://www.eathappyproject.com/wp-content/uploads/2020/08/home-decor.jpg',
  tags: ['nft', 'eathappyproject', 'Ashas'],
  ownerWalletId: 'ashasahmad.near',
  ownerId: 'RZTiIbxAVfmhVAmdEYclm',
  nftId: 's2fwZUGh8FMbFVvkxjX3m',
  status: 'pending',
  transactionId: 'hgd2U_ECqKMK_7pN-qJAv',
  created: 1646990846334,
  update: 1646990846334,
};
const nft2 = {
  title: 'Ashas Test 1  Shift 3',
  description: 'test nft from Ashas from Shift 3',
  categoryId: 'XNwyaIOPKkfc1iFngXorm',
  filePath:
    'https://www.eathappyproject.com/wp-content/uploads/2020/08/home-decor.jpg',
  tags: ['nft', 'eathappyproject', 'Ashas'],
  ownerWalletId: 'titusWallet.near',
  ownerId: 'RZTiIbxAVfmhVAmdEYclm',
  nftId: 's2fwZUGh8FMbFVvkxjX3m',
  status: 'pending',
  transactionId: 'hgd2U_ECqKMK_7pN-qJAv',
  created: 1646990846334,
  update: 1646990846334,
};
const incorrectNft = {
  title: 'Ashas Test 1  Shift 3',
  description: 'test nft from Ashas from Shift 3',
  categoryId: 'XNwyaIOPKkfc1iFngXorm',
  filePath:
    'https://www.eathappyproject.com/wp-content/uploads/2020/08/home-decor.jpg',
  tags: ['nft', 'eathappyproject', 'Ashas'],
  ownerWalletId: 'ashasahmad.near',
  ownerId: 'RZTiIbxAVfmhVAmdEYclm',
  nftId: 's2fwZUGh8FMbFVvkxjX3asam',
  status: 'pending',
  transactionId: 'hgd2U_ECqKMK_7pN-qJAv',
  created: 1646990846334,
  update: 1646990846334,
};
const myNft = {
  title: 'Ashas Test 1  Shift 3',
  description: 'test nft from Ashas from Shift 3',
  categoryId: 'XNwyaIOPKkfc1iFngXorm',
  filePath:
    'https://www.eathappyproject.com/wp-content/uploads/2020/08/home-decor.jpg',
  tags: ['nft', 'eathappyproject', 'Ashas'],
  ownerWalletId: 'titusWallet.near',
  ownerId: 'RZTiIbxAVfmhVAmdEYclm',
  nftId: 's2fwZUGh8FMbFVvkxjX3m',
  status: 'pending',
  transactionId: 'hgd2U_ECqKMK_7pN-qJAv',
  created: 1646990846334,
  update: 1646990846334,
};
const contacts = [
  {
    contactId: '_0iM8scD5fkKFi6l9tMo0',
    firstName: 'John',
    lastName: 'Doe',
    jobTitle: 'Software Engineer',
    email: [
      {
        address: 'johndoe@primelab.io',
        type: 'corporative',
      },
    ],
    phone: [
      {
        number: '123456789',
        type: 'mobile',
      },
    ],
    address: [
      {
        street: 'St Saint Peter',
        city: 'Unknown',
        region: 'South East',
        country: 'Cão Maior',
        postalCode: '123456789',
        type: 'home',
      },
    ],
    companies: ['Weiland'],
    groups: ['Terraquian'],
    importSource: 'UniIndexer',
    appId: '123456789',
    status: 'active',
    created: 1644845147321,
    updated: 1644845147321,
    modified: 1644845147321,
  },
  {
    contactId: '_0iM999D5fkKFi6l9tMo0',
    firstName: 'Jane',
    lastName: 'Doe',
    jobTitle: 'Software Engineer',
    email: [
      {
        address: 'johndoe@primelab.io',
        type: 'corporative',
      },
    ],
    phone: [
      {
        number: '123456789',
        type: 'mobile',
      },
    ],
    address: [
      {
        street: 'St Saint Peter',
        city: 'Unknown',
        region: 'South East',
        country: 'Cão Maior',
        postalCode: '123456789',
        type: 'home',
      },
    ],
    companies: ['Weiland'],
    groups: ['Terraquian'],
    importSource: 'UniIndexer',
    appId: '123456789',
    status: 'active',
    created: 1644845147321,
    updated: 1644845147321,
    modified: 1644845147321,
  },
];

const contacts2 = [
  {
    contactId: '_0iM8scD5fkKFi6l9tMo0',
    firstName: 'John',
    lastName: 'Doe',
    jobTitle: 'Software Engineer',
    email: [
      {
        address: 'johndoe@primelab.io',
        type: 'corporative',
      },
    ],
    phone: [
      {
        number: '123456789',
        type: 'mobile',
      },
    ],
    address: [
      {
        street: 'St Saint Peter',
        city: 'Unknown',
        region: 'South East',
        country: 'Cão Maior',
        postalCode: '123456789',
        type: 'home',
      },
    ],
    companies: ['Weiland'],
    groups: ['Terraquian'],
    importSource: 'UniIndexer',
    appId: '123456789',
    status: 'active',
    created: 1644845147321,
    updated: 1644845147321,
    modified: 1644845147321,
  },
];

const contactsWithExistingUserId = [
  {
    contactId: '28p5XRTIoOBFU_ui6sBzB',
    firstName: 'John',
    lastName: 'Doe',
    jobTitle: 'Software Engineer',
    email: [
      {
        address: 'johndoe@primelab.io',
        type: 'corporative',
      },
    ],
    phone: [
      {
        number: '123456789',
        type: 'mobile',
      },
    ],
    address: [
      {
        street: 'St Saint Peter',
        city: 'Unknown',
        region: 'South East',
        country: 'Cão Maior',
        postalCode: '123456789',
        type: 'home',
      },
    ],
    companies: ['Weiland'],
    groups: ['Terraquian'],
    importSource: 'UniIndexer',
    appId: '123456789',
    status: 'active',
    created: 1644845147321,
    updated: 1644845147321,
    modified: 1644845147321,
    linkedUserId: '4wPwzOmZ6ZgA2rta_zTzG',
  },
  {
    contactId: '2wwwXRTIoOBFU_ui6sBzB',
    firstName: 'John',
    lastName: 'Doe',
    jobTitle: 'Software Engineer',
    email: [],
    phone: [
      {
        number: '123456789',
        type: 'mobile',
      },
    ],
    address: [
      {
        street: 'St Saint Peter',
        city: 'Unknown',
        region: 'South East',
        country: 'Cão Maior',
        postalCode: '123456789',
        type: 'home',
      },
    ],
    companies: ['Weiland'],
    groups: ['Terraquian'],
    importSource: 'UniIndexer',
    appId: '123456789',
    status: 'active',
    created: 1644845147321,
    updated: 1644845147321,
    modified: 1644845147321,
  },
  {
    contactId: '_0iM999D5fkKFi6l9tMo0',
    firstName: 'Jane',
    lastName: 'Doe',
    jobTitle: 'Software Engineer',
    email: [
      {
        address: 'johndoe@primelab.io',
        type: 'corporative',
      },
    ],
    phone: [],
    address: [
      {
        street: 'St Saint Peter',
        city: 'Unknown',
        region: 'South East',
        country: 'Cão Maior',
        postalCode: '123456789',
        type: 'home',
      },
    ],
    companies: ['Weiland'],
    groups: ['Terraquian'],
    importSource: 'UniIndexer',
    appId: '123456789',
    status: 'active',
    created: 1644845147321,
    updated: 1644845147321,
    modified: 1644845147321,
  },
];

const blankContacts = [];

const users = [
  {
    userId: '4wPwzOmZ6ZgA2rta_zTzG',
    firstName: 'test1',
    lastName: 'user1',
    walletId: 'testuser1.near',
    email: 'mock-test1@primelab.io',
    phone: '+2551817181',
    dob: '2000-10-10',
  },
  {
    userId: 'testshdiuhjskkdjks',
    firstName: 'test2',
    lastName: 'user2',
    walletId: 'testuser2.near',
    email: 'mock-test2@primelab.io',
    phone: '+2551817182',
    dob: '2000-10-10',
  },
];
const payload = {
  contactIds: [
    '28p5XRTIoOBFU_ui6sBzB',
    '2wwwXRTIoOBFU_ui6sBzB',
    '_0iM999D5fkKFi6l9878989',
  ],
};
const emptyPayload = {};
const malformedPayload = { contactIds: '28p5XRTIoOBFU_ui6sBzB' };

const AuthCode =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsYXN0TmFtZSI6Iktpdml0ZSIsInVzZXJJZCI6Il9CRV9PdTVleFhxVy13Rkx1VHh1ZCIsInN0YXR1cyI6ImFjdGl2ZSIsImNyZWF0ZWQiOjE2NDYyMDkzMTg3MTAsImlzUGhvbmVWZXJpZmllZCI6ZmFsc2UsImVtYWlsIjoidGtpdml0ZUBnbWFpbC5jb20iLCJmaXJzdE5hbWUiOiJUaXR1cyIsImlzRW1haWxWZXJpZmllZCI6ZmFsc2UsIndhbGxldE5hbWUiOiJ0aXR1c1dhbGxldC5uZWFyIiwiaWF0IjoxNjQ2MzI3MTMzLCJleHAiOjE2NDY0MTM1MzN9.PFA57GwzBuIM8O04XICee1xFTciApptbDCGTjTWPtyU';
const nftId = 'R6lCzCQE9sutEtWGkLFbp';
module.exports = {
  jwtMock,
  AuthCode,
  nftId,
  emptyPayload,
  payload,
  malformedPayload,
  incorrectNft,
  nft,
  myNft,
  contacts,
  users,
  nft2,
  contacts2,
  blankContacts,
  contactsWithExistingUserId,
};
