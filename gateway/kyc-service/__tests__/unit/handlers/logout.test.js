// @ts-nocheck
/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { StatusCodes } = require('http-status-codes');
const lambda = require('../../../logout');
const utils = require('../../../utils');

describe('Test Case KYC service logout lambda', () => {
  it('should pass when user logged out successfully', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {},
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'You have successfully logged out',
    });
    expect(result).toEqual(expectedResult);
  });
});
