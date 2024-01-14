const { StatusCodes } = require('http-status-codes');
const { nanoid } = require('nanoid');
const utils = require('./utils');
const schema = require('./validation/user-schema');

const createUser = async (request) => {
  const user = { ...request };

  const params = {
    Item: {
      userId: nanoid(),
      created: +new Date(),
      status: utils.UserStatus.Active.name,
      isPhoneVerified: false,
      isEmailVerified: false,
      wallets: [],
      ...user,
    },
    TableName: 'near-users',
  };

  await utils.dynamoDb.put(params);

  return params.Item;
};

module.exports.handler = async (event) => {
  try {
    // event.body;
    if (!event.body) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'Payload is missing',
      });
    }

    const params = JSON.parse(event.body);

    const { error } = schema.validate(params, { abortEarly: false });

    if (error) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        errors: error.details.map((item) => item.message),
      });
    }

    // if (await checkUserExists(params.email, params.phone)) {
    //   return utils.send(StatusCodes.BAD_REQUEST, {
    //     message: 'User already exists.',
    //     data: params,
    //   });
    // }

    // if (await checkWalletExists(params.walletId)) {
    //   return utils.send(StatusCodes.BAD_REQUEST, {
    //     message: 'WalletId already exists.',
    //     data: params,
    //   });
    // }

    const dbUser = await createUser(params);

    // const dbWallet = await createWallet(dbUser.userId, params.walletId);

    const response = {
      data: {
        jwtAccessToken: '',
        jwtRefreshToken: '',
        user: { ...dbUser },
      },
    };

    return utils.send(StatusCodes.CREATED, response);
  } catch (err) {
    console.log(err);
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Ops...',
    });
  }
};
