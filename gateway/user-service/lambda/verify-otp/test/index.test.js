const { StatusCodes } = require('http-status-codes');
const SNS = require('aws-sdk/clients/sns');
const SES = require('aws-sdk/clients/ses');
const axios = require('axios');
const utils = require('../../../utils');
const { handler } = require('../index');

jest.mock('axios');

jest.mock('aws-sdk/clients/ses', () => {
  const mockSES = {
    sendEmail: jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnThis(),
    }),
  };
  return jest.fn(() => mockSES);
});
jest.mock('aws-sdk/clients/sns', () => {
  const mockSNS = {
    publish: jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnThis(),
    }),
  };
  return jest.fn(() => mockSNS);
});

const sesClient = new SES();
const snsClient = new SNS();

describe('Calling Check Phone Handler To Test', () => {
  let getSpy;
  let querySpy;
  let scanSpy;
  beforeAll(() => {
    getSpy = jest.spyOn(utils.dynamoDb, 'get');
    querySpy = jest.spyOn(utils.dynamoDb, 'query');
    scanSpy = jest.spyOn(utils.dynamoDb, 'scan');
  });

  afterAll(() => {
    getSpy.mockRestore();
    querySpy.mockRestore();
    scanSpy.mockRestore();
  });

  it('invalid json', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: [],
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Ops...',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when email or phone is missing', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({}),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['email is a required field', 'phone is a required field'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when email pattern does not match', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ email: 'aksjdlkas' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['email fails to match the required pattern'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when email is empty', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ email: '' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['email must contain value'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when email is integer', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ email: 12938123 }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['email must be a type of string'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when phone pattern does not match', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ phone: 'aksjdlkas' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['phone fails to match the required pattern'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when phone is empty', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ phone: '' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['phone must contain value'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when phone is integer', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ phone: 12938123 }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['phone must be a type of string'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when otp is integer', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ phone: '+918912831923', OTP: 123 }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['\"OTP\" must be a string'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when otp is empty', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ phone: '+918912831923', OTP: '' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['\"OTP\" is not allowed to be empty'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when otp is integer', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ phone: '+918912831923', OTP: '123' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['OTP is not a valid input for OTP, only takes numbers'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when phone not found', async () => {
    axios.get.mockImplementationOnce(() => Promise.reject({ response: { status: 400 } }));
    querySpy.mockResolvedValueOnce({
      promise: () => Promise.resolve({
        Count: 0,
        Items: [],
      }),
    });
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({
        phone: '+918912831923',
        OTP: '123143'
      }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Ops...',
    });
    expect(result).toEqual(expectedResult);
  });

  it('not match case phone', async () => {
    querySpy.mockResolvedValueOnce({
      Count: 1,
      Items: [{ phone: '9182938123' }]
    });
    scanSpy.mockResolvedValueOnce({ Count: 0 })
    snsClient.publish().promise.mockResolvedValue(true);
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ phone: '+918912831923', OTP: '123143' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Incorrect code, please enter a valid code',
    });
    expect(result).toEqual(expectedResult);
  });

  it('not match case email', async () => {
    querySpy.mockResolvedValueOnce({
      Count: 1,
      Items: [{ email: 'aksdjka@gmai.com', userId: 'asdf' }],
    });
    scanSpy.mockResolvedValueOnce([])
    snsClient.publish().promise.mockResolvedValue(true);
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ email: 'aksdjka@gmai.com', OTP: '123143' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Incorrect code, please enter a valid code',
    });
    expect(result).toEqual(expectedResult);
  });
  
  it('should success when proper values are provided', async () => {
    querySpy.mockResolvedValueOnce({
      Count: 1,
      Items: [{ email: 'aksdjka@gmai.com', userId: 'asdf' }],
    });
    scanSpy.mockResolvedValueOnce([{ email: 'aksdjka@gmai.com' }])
    snsClient.publish().promise.mockResolvedValue(true);
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ email: 'aksdjka@gmai.com', OTP: '123143' }),
    };

    const result = await handler(event);
    // const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
    //   message: 'Incorrect code, please enter a valid code',
    // });
    expect(result).toEqual(undefined);
  });
});
