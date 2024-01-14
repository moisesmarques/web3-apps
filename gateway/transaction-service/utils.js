const _ = require('underscore');
const SQS = require('aws-sdk/clients/sqs');
const SSM = require('aws-sdk/clients/ssm');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const { nanoid } = require('nanoid');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const nearAPI = require('near-api-js');

const {
  STAGE, CONTRACTS_SERVICE_POST_SQS_MAINNET, CONTRACTS_SERVICE_POST_SQS_TESTNET, CONTRACT_MINT_NFT_MAINNET, CONTRACT_MINT_NFT_TESTNET, REGION, HASH_URL, CONTRACT_CREATE_ACCOUNT_MAINNET, CONTRACT_CREATE_ACCOUNT_TESTNET, CONTRACT_SEND_MAINNET, CONTRACT_SEND_TESTNET, CONTRACT_USERID_MAINNET, CONTRACT_USERID_TESTNET, NETWORK_MAINNET, NETWORK_TESTNET,
} = process.env;
const CONTRACTS_SERVICE_POST_SQS = STAGE === 'dev' ? CONTRACTS_SERVICE_POST_SQS_MAINNET : CONTRACTS_SERVICE_POST_SQS_TESTNET;
const CONTRACT_MINT_NFT = STAGE === 'dev' ? CONTRACT_MINT_NFT_MAINNET : CONTRACT_MINT_NFT_TESTNET;
const CONTRACT_SEND = STAGE === 'dev' ? CONTRACT_SEND_MAINNET : CONTRACT_SEND_TESTNET;
const CONTRACT_USERID = STAGE === 'dev' ? CONTRACT_USERID_MAINNET : CONTRACT_USERID_TESTNET;
const CONTRACT_CREATE_ACCOUNT = STAGE === 'dev' ? CONTRACT_CREATE_ACCOUNT_MAINNET : CONTRACT_CREATE_ACCOUNT_TESTNET;
const NETWORK = STAGE === 'dev' ? NETWORK_MAINNET : NETWORK_TESTNET;

const { generateSeedPhrase } = require('./near-utils');

const docClient = new DynamoDB.DocumentClient();
const sqs = new SQS({
  region: REGION,
});
const ssm = new SSM();

let SECRET_KEY = null;

const send = (statusCode, data, err = null) => {
  const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  };

  if (err) {
    if (['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'].includes(err.name)) {
      const { message } = err;
      return {
        statusCode: 401,
        headers: responseHeaders,
        body: JSON.stringify({
          message,
        }),
      };
    }
  }

  return {
    statusCode,
    headers: responseHeaders,
    body: JSON.stringify(data, null, 2),
  };
};

const publishBase = async (data, queueUrl, messageGroupId) => {
  try {
    console.log('Publishing on SQS:', queueUrl, data);

    const message = {
      MessageBody: JSON.stringify(data),
      QueueUrl: queueUrl,
    };

    if (messageGroupId) {
      message.MessageGroupId = messageGroupId;
    }

    const response = await sqs.sendMessage(message).promise();

    console.log('Message published on SQS:', queueUrl, response);
  } catch (err) {
    console.log('Error when publishing on SQS:', queueUrl, err);
  }
};

const publish = async (data, queueUrl) => {
  await publishBase(data, queueUrl, 'contract-server');
};

const storeHash = async (params) => {
  let response = { id: nanoid() };
  try {
    const apiHeaders = {
      'Content-Type': 'application/json',
    };
    response = await axios.post(`${HASH_URL}`, JSON.stringify(params), {
      headers: apiHeaders,
    });
  } catch (err) {
    console.log(err);
  }

  return response;
};

const createTransaction = async (params, txType = null) => {
  const transactionId = nanoid();
  const jobId = transactionId.replace(/[^a-zA-Z0-9]/g, '');
  const jobIdLcase = jobId.toLowerCase();

  const {
    senderWalletId, ownerWalletId, transactionValue, transactionItemId, fileHash, tags, type, status, contractData, parentId, transactionUrl, appId, actionId, nearAmount, notes,
  } = params;
  let { receiverWalletId } = params;
  receiverWalletId = undefined;
  if (senderWalletId != ownerWalletId) {
    if (senderWalletId) {
      receiverWalletId = senderWalletId;
    }
  }

  const tableParams = {
    TableName: 'near-transactions',
    Item: {
      transactionId,
      senderWalletId,
      receiverWalletId,
      ownerWalletId: ownerWalletId || senderWalletId,
      transactionValue,
      transactionItemId,
      type: txType || type,
      operation: type,
      fileHash,
      nearAmount,
      notes,
      tags,
      jobId: jobIdLcase,
      status: status || 'complete',
      contractData,
      blockchainStatus: 'pending',
      parentId,
      transactionUrl,
      appId,
      actionId,
      created: +new Date(),
      updated: +new Date(),
      requestParams: JSON.stringify(params),
    },
  };
  console.log(tableParams);
  await docClient.put(tableParams).promise();
  return tableParams.Item;
};

const updateTransaction = async (transactionId, data) => {
  const tableParams = {
    TableName: 'near-transactions',
    Key: {
      transactionId,
    },
    ...buildUpdateExpression(data),
  };
  return docClient.update(tableParams).promise();
};

const getWallet = async (walletId) => {
  const tableParams = {
    TableName: 'near-wallets',
    KeyConditionExpression: 'walletId = :walletId ',
    ExpressionAttributeValues: { ':walletId': walletId },
  };
  return docClient.query(tableParams).promise();
};

const storeKeys = async (params) => {
  const secrets = generateSeedPhrase();
  const { senderWalletId, status } = params;

  const tableParams = {
    TableName: 'near-wallets-private',
    Item: {
      walletId: senderWalletId,
      // userId: walletId, // Nicholas said this is not being usedfix()
      pubKey: secrets.publicKey,
      privateKey: secrets.secretKey,
      seedPhrase: secrets.seedPhrase,
      status: status || 'complete',
      blockchainStatus: 'pending',
      created: +new Date(),
      updated: +new Date(),
    },
  };
  await docClient.put(tableParams).promise();
  return secrets;
};

const createAccountMessage = async (transaction) => ({
  id: transaction.jobId,
  operation: 'execute',
  contract: CONTRACT_CREATE_ACCOUNT, // 'near',
  method: 'create_account',
  args: {
    new_account_id: transaction.senderWalletId,
    new_public_key: transaction.publicKey,
  },
  sender: transaction.senderWalletId,
  tags: {
    app_id: transaction.appId,
    action_id: transaction.actionId,
    user_id: transaction.senderWalletId,
  },
});

const createNFTCreateSeriesMessage = async (transaction, reqParams) => {
  // eslint-disable-next-line object-curly-newline
  const { walletId, name, capacity, appId, actionId } = reqParams;
  const { senderWalletId, jobId } = transaction;
  const walletIdHash = await storeHash({ input: walletId });

  return {
    id: jobId,
    operation: 'execute',
    contract: CONTRACT_MINT_NFT,
    method: 'nft_series_create',
    sender: senderWalletId,
    args: {
      name,
      capacity,
      creator: senderWalletId,
    },
    tags: {
      app_id: appId,
      action_id: actionId,
      user_id: senderWalletId,
    },
  };
};

const createAccount = async (params) => {
  const newTransaction = await createTransaction(params);
  console.log('newTransaction -> ', newTransaction);

  const walletData = await getWallet(params.senderWalletId);
  console.log('walletData -> ', walletData);

  const { Items, Count } = walletData;

  if (Count) {
    const [walletObj] = Items;
    newTransaction.userId = walletObj.userId;
  }
  console.log('params after userid -> ', newTransaction);

  // Store keys
  const { publicKey } = await storeKeys(newTransaction);

  newTransaction.publicKey = publicKey;

  const createAccountObj = await createAccountMessage(newTransaction);
  console.log('baseObj---> ', createAccountObj);

  await publish(createAccountObj, CONTRACTS_SERVICE_POST_SQS);

  return newTransaction;
};

const createNFTSeries = async (params) => {
  const newTransaction = await createTransaction(params);

  const newNFTSeries = await createNFTCreateSeriesMessage(newTransaction, params);
  console.log('baseObj---> ', newNFTSeries);

  await publish(newNFTSeries, CONTRACTS_SERVICE_POST_SQS);
  return newTransaction;
};

const sendToken = async (params, headers) => {
  const { walletId } = await verifyAccessToken({ headers });
  if (walletId !== params.ownerWalletId) {
    throw new Error('You are not authorized to make this transaction');
  }
  const newTransaction = await createTransaction(params);
  // const sendToken = await createSendTokenMessage(newTransaction, params);
  // console.log('baseObj---> ', sendToken);
  //
  // await publish(sendToken, CONTRACTS_SERVICE_POST_SQS);

  // TODO be sure send Message to blockchain service will work properly?
  /*
     * Users need to wait too much times and even how can handle error messages when failed
     * If we are using SQS, we need to websocket for updating front end and hard to update ASAP even its finished
     * Frontend is need to check existence of wallet while input wallet address.
     * */

  const senderPrivateKey = await getWalletPrivate(walletId);
  if (!senderPrivateKey) {
    throw new Error('Wallet or private key not found.');
  }
  const { connect, keyStores, KeyPair } = nearAPI;
  const keyStore = new keyStores.InMemoryKeyStore();
  const keyPair = KeyPair.fromString(senderPrivateKey.privateKey);
  await keyStore.setKey(NETWORK, walletId, keyPair);
  const amount = nearAPI.utils.format.parseNearAmount(String(params.nearAmount));
  const config = {
    networkId: NETWORK,
    keyStore,
    nodeUrl: `https://rpc.${NETWORK}.near.org`,
    walletUrl: `https://wallet.${NETWORK}.near.org`,
    helperUrl: `https://helper.${NETWORK}.near.org`,
    explorerUrl: `https://explorer.${NETWORK}.near.org`,
  };

  const near = await connect(config);
  const senderAccount = await near.account(walletId);
  const result = await senderAccount.sendMoney(params.receiverWalletId, amount);
  if (result) {
    const updateObject = {
      transactionHash: result.transaction.hash,
      contractOutArgs: result.transaction,
      blockchainStatus: 'complete',
      updated: +new Date(),
    };
    await updateTransaction(newTransaction.transactionId, updateObject);
    return { ...newTransaction, ...updateObject };
  }
  return newTransaction;
};

const createSendTokenMessage = async (transaction, params) => ({
  id: transaction.jobId,
  operation: 'execute',
  contract: CONTRACT_SEND,
  method: 'send_token',
  args: {
    receiver: params.receiverWalletId,
    near_amount: params.nearAmount,
    notes: params.notes,
  },
  sender: transaction.senderWalletId,
  tags: {
    app_id: transaction.appId,
    action_id: transaction.actionId,
    user_id: transaction.senderWalletId,
  },
});

const createMintNftMessage = async (transaction, reqParams) => {
  const { senderWalletId, jobId } = transaction;
  const walletIdHash = await storeHash({ input: senderWalletId });
  const {
    deposit, seriesId, title, description, media, mediaHash, copies, issuedAt, expiresAt, startsAt, updatedAt, extra, reference, referenceHash, appId, actionId,
  } = reqParams;

  return {
    id: jobId,
    operation: 'execute',
    contract: CONTRACT_MINT_NFT,
    method: 'nft_series_mint',
    sender: senderWalletId,
    deposit,
    args: {
      series_id: seriesId,
      token_owner_id: senderWalletId,
      token_metadata: {
        title,
        description,
        media,
        media_hash: mediaHash,
        copies,
        issued_at: issuedAt,
        expires_at: expiresAt,
        starts_at: startsAt,
        updated_at: updatedAt,
        extra,
        reference,
        reference_hash: referenceHash,
      },
    },
    tags: {
      app_id: appId,
      action_id: actionId,
      user_id: senderWalletId,
    },
  };
};

const mintNftSeries = async (params) => {
  const newTransaction = await createTransaction(params);
  const mintNft = await createMintNftMessage(newTransaction, params);
  console.log('baseObj---> ', mintNft);

  await publish(mintNft, CONTRACTS_SERVICE_POST_SQS);
  return newTransaction;
};

const createNftSeriesAndMint = async (params) => {
  const data = params;
  // we first create the parent transaction
  const nftSeriesTransaction = await createTransaction(data, 'nft_series_create');
  console.log('nftSerieTransaction---> ', nftSeriesTransaction);

  // then we create the child transaction
  data.parentId = nftSeriesTransaction.transactionId;
  const nftMint = await createTransaction(data, 'nft_series_mint');
  console.log('nftMint---> ', nftMint);

  // eslint-disable-next-line max-len
  // the series goes to the blockchain, the child will follow when the series is created in the blockchain
  const nftSeriesMessage = await createNFTCreateSeriesMessage(nftSeriesTransaction, data);
  console.log('baseObj---> ', nftSeriesMessage);

  await publish(nftSeriesMessage, CONTRACTS_SERVICE_POST_SQS);

  return nftSeriesTransaction;
};

const createGetTransactionFeeMessage = (jobId, senderWalletId, appId, actionId) => ({
  id: jobId,
  operation: 'execute',
  contract: CONTRACT_SEND,
  method: 'send_logged',
  deposit: '0.00072',
  args: {
    receiver: senderWalletId,
    amount: '700000000000000000000',
    nearapps_tags: {
      app_id: appId,
      action_id: actionId,
      user_id: CONTRACT_USERID,
    },
  },
  tags: {
    app_id: appId,
    action_id: actionId,
    user_id: CONTRACT_USERID,
  },
});

const logFileOperation = async (params) => {
  const transaction = await createTransaction(params, 'log_file');

  const getTransactionFeeMessage = createGetTransactionFeeMessage(transaction.jobId, transaction.senderWalletId, transaction.appId, transaction.actionId);

  await publish(getTransactionFeeMessage, CONTRACTS_SERVICE_POST_SQS, 'contract_service');

  return transaction;
};

const saveHidden = async (hidden, value) => {
  if (!value) return;
  const tableParams = {
    TableName: 'near-hidden',
    Item: {
      id: hidden,
      value,
    },
  };
  console.log('saving to near hidden --> ', tableParams);
  const { Item } = await docClient.put(tableParams).promise();
  console.log('saving to near hidden  Item --> ', Item);
  return Item;
};

const preapareNanoHash = () =>
// eslint-disable-next-line implicit-arrow-linebreak
  nanoid()
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();

const hashDataForBlockChain = async (params) => {
  const data = params;
  const newAppId = preapareNanoHash();
  const newActionId = preapareNanoHash();
  const newReference = preapareNanoHash();
  const newMedia = preapareNanoHash();

  await Promise.all([saveHidden(newActionId, data.actionId), saveHidden(newReference, data.reference), saveHidden(newMedia, data.media)]);

  data.appId = newAppId;
  data.actionId = newActionId;

  if (data.reference) {
    data.reference = newReference;
  }
  if (data.media) {
    data.media = newMedia;
  }
  console.log('hashDataForBlockChain data - ', data);
};

const getWalletPrivate = async (walletId) => {
  const tableParams = {
    TableName: 'near-wallets-private',
    KeyConditionExpression: 'walletId = :walletId ',
    ExpressionAttributeValues: { ':walletId': walletId },
  };
  const { Items } = await docClient.query(tableParams).promise();
  return Items[0];
};

const validateWallet = async (senderWalletId) => {
  const walletData = await getWallet(senderWalletId);

  if (!walletData || !walletData.Count) {
    console.log('ERROR validating wallet status -  WALLET NOT FOUND');
    throw new Error(`Wallet '${senderWalletId}' not found`);
  }

  const {
    Items: [walletObj],
  } = walletData;
  if (walletObj.blockchainStatus !== 'complete') {
    console.log('ERROR validating wallet status - WALLET STATUS NOT COMPLETE ON BLOCKCHAIN ---> ', walletObj);
    throw new Error('ERROR validating wallet status - WALLET STATUS NOT COMPLETE ON BLOCKCHAIN');
  }
};

//
const processObjMapping = {
  send_token: sendToken,
  create_account: createAccount,
  create_file: logFileOperation,
  delete_file: logFileOperation,
  grant_file_access: logFileOperation,
  revoke_file_access: logFileOperation,
  nft_series_create: createNFTSeries,
  nft_series_mint: mintNftSeries,
  create_and_mint_nft: createNftSeriesAndMint,
};

const processOperation = async (params, headers) => {
  if (!params.type || !processObjMapping[params.type]) {
    return;
  }

  // if(params.type !== 'create_account')
  //   await validateWallet(params.senderWalletId); //there is not near-wallet-private on sandbox

  // TODO: improve this, quick fix now, override appId and hashId
  await hashDataForBlockChain(params);

  return processObjMapping[params.type](params, headers);
};

const getParameter = async (Name, WithDecryption) => {
  const result = await ssm.getParameter({ Name, WithDecryption }).promise();
  return result.Parameter.Value;
};

const toTimestamp = (strDate) => Date.parse(strDate);

const verifyAccessToken = async (req) => {
  try {
    const token = req.headers.Authorization || req.headers.authorization;
    if (!token) {
      throw new Error('Access Token is required.');
    }
    if (!SECRET_KEY) {
      SECRET_KEY = await getParameter('SECRET_KEY');
    }
    const userInfo = await jwt.verify(token.replace('Bearer ', ''), SECRET_KEY);
    userInfo.walletId = userInfo.walletId || userInfo.walletName;
    userInfo.walletName = userInfo.walletId || userInfo.walletName;
    return userInfo;
  } catch (err) {
    console.error(`verifyAccessToken: ${err.message}`);
    throw err;
  }
};

const buildUpdateExpression = (inputParams) => {
  // Function to generate update expression for DynamoDB automatically based on the inputParams
  let updateExpression = '';
  const finalExpression = {};
  const expAttrNames = {};
  const expAttValues = {};
  const systemValReplacements = {
    status: 'x_status',
    type: 'x_type',
  };
  for (const attr in inputParams) {
    const emptyExpAttrNames = false;
    const replacedAttrVal = attr && systemValReplacements[attr] ? systemValReplacements[attr] : '';
    if (replacedAttrVal && !updateExpression) {
      updateExpression += `set #${replacedAttrVal} = :new_${attr}`;
    } else if (replacedAttrVal) {
      updateExpression += `, #${replacedAttrVal} = :new_${attr}`;
    }
    if (!replacedAttrVal && attr && !updateExpression) {
      updateExpression += `set ${attr} = :new_${attr}`;
    } else if (!replacedAttrVal && attr) {
      updateExpression += `, ${attr} = :new_${attr}`;
    }
    if (attr) {
      expAttValues[`:new_${attr}`] = inputParams[attr];
    }
    if (replacedAttrVal) {
      expAttrNames[`#${replacedAttrVal}`] = attr;
    }
  }
  if (!_.isEmpty(updateExpression)) {
    finalExpression.UpdateExpression = updateExpression;
  }
  if (!_.isEmpty(expAttrNames)) {
    finalExpression.ExpressionAttributeNames = expAttrNames;
  }
  if (!_.isEmpty(expAttValues)) {
    finalExpression.ExpressionAttributeValues = expAttValues;
  }
  return finalExpression;
};

module.exports = {
  send,
  processOperation,
  toTimestamp,
  verifyAccessToken,
  buildUpdateExpression,
};
