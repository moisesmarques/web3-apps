const Promise = require('bluebird');
const nearAPI = require('near-api-js');
const { getPrivateKey } = require('./utils');

const {
  STAGE, NETWORK_MAINNET, NETWORK_TESTNET, CONTRACT_LOG_FILE_MAINNET, CONTRACT_LOG_FILE_TESTNET,
} = process.env;
const NETWORK = STAGE === 'dev' ? NETWORK_MAINNET : NETWORK_TESTNET;
const CONTRACT_LOG_FILE = STAGE === 'dev' ? CONTRACT_LOG_FILE_MAINNET : CONTRACT_LOG_FILE_TESTNET;

exports.handler = async (event) => {
  // eslint-disable-next-line consistent-return,no-shadow
  await Promise.map(event.Records, async (event) => {
    console.log(event);
    const { body } = event;
    const params = body ? JSON.parse(body) : {};
    try {
      console.log('PROCESS LOG FILE ----> ', params);

      params.senderPrivateKey = await getPrivateKey(params.senderWalletId);

      if (params.senderPrivateKey === '') throw new Error('Wallet or private key not found.');

      const { connect, keyStores, KeyPair } = nearAPI;
      const keyPair = KeyPair.fromString(params.senderPrivateKey);
      const keyStore = new keyStores.InMemoryKeyStore();
      await keyStore.setKey(NETWORK, params.senderWalletId, keyPair);

      const config = {
        networkId: NETWORK,
        keyStore,
        nodeUrl: `https://rpc.${NETWORK}.near.org`,
        walletUrl: `https://wallet.${NETWORK}.near.org`,
        helperUrl: `https://helper.${NETWORK}.near.org`,
        explorerUrl: `https://explorer.${NETWORK}.near.org`,
      };

      const near = await connect(config);

      const account = await near.account(params.senderWalletId);

      const contract = new nearAPI.Contract(
        account,
        CONTRACT_LOG_FILE,
        {
          changeMethods: ['log_event'],
          sender: account,
        },
      );

      const response = await contract.log_event({
        args: {
          time: +new Date(),
          operation: params.operation,
          hash: params.fileHash,
          receiver_wallet_id: params.receiverWalletId,
        },
        gas: '6000000000000',
      });

      console.log(response);

      return response;
    } catch (err) {
      console.log('File Operation processing failed!', err);
    }
  }, { concurrency: 10 });
};
