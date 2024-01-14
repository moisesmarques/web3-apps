/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { StatusCodes } = require('http-status-codes');

const lambda = require('../../../verify-otp');
const utils = require('../../../utils');

describe('Test Case kyc service verify otp lambda', () => {
  let getAuthResponseSpy;

  beforeAll(() => {
    getAuthResponseSpy = jest.spyOn(utils, 'getAuthResponse');
  });
  it('should fail when body is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Ops...',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({ OTP: '123456' }),
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['walletID is a required field'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId is not string', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        OTP: '123456',
        walletID: 1234,
      }),
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['walletID must be a type of string'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId empty string', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        OTP: '123456',
        walletID: '',
      }),
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['walletID must contain value'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId is longer than allowed', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        OTP: '123456',
        walletID: 'thisStringIsLongerThanFiftyCharactersJustToTest.testnet',
      }),
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['"walletID" length must be less than or equal to 50 characters long'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId doesn\'t end in ".near" or ".testnet"', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        OTP: '123456',
        walletID: 'sample',
      }),
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['walletID fails to match the required pattern'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when OTP in not string', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        OTP: 123456,
        walletID: 'testWallet.testnet',
      }),
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['"OTP" must be a string'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when OTP length is not correct', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        OTP: '1234567',
        walletID: 'testWallet.testnet',
      }),
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['"OTP" length must be 6 characters long'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when OTP pattern doesn\'t match', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        OTP: '12345a',
        walletID: 'testWallet.testnet',
      }),
    };

    const result = await lambda.handler(event);
    const pattern = /^[0-9]+$/;
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: [`"OTP" with value "12345a" fails to match the required pattern: ${pattern}`],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when OTP is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        walletID: 'testWallet.testnet',
      }),
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['OTP is a required field'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when extra param in body', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        OTP: '123456',
        walletID: 'testWallet.testnet',
        extraParam: 1234,
      }),
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['"extraParam" is not allowed'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when OTP is not "222222"', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        walletID: 'testWallet.testnet',
        OTP: '123456',
      }),
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'OTP not provided, is invalid or expired',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should pass when OTP is "222222"', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        walletID: 'testWallet.testnet',
        OTP: '222222',
      }),
    };

    getAuthResponseSpy.mockResolvedValueOnce(true);
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, true);
    expect(result).toEqual(expectedResult);
  });
});
