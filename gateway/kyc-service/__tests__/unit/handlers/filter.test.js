/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');

const lambda = require('../../../filter');
const utils = require('../../../utils');
const schema = require('../../../validation/filter-validation-schema');

const jestCategoriesMock = require('../mock/app-categories.json');

// Test-1 for get ALL Categories
describe('Test Case kyc service filter lambda', () => {
  let getSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'scan');
  });

  afterAll(() => {
    getSpy.mockRestore();
  });

  afterAll(() => {
    getSpy.mockRestore();
  });

  // Test-2 for get All Categories
  it('should fail when TabelName is missing in the params', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
    };

    const result = await lambda.getAllCategories(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Ops...',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should pass when all categories fetch', async () => {
    const item = jestCategoriesMock.appCategoryData;
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [item] }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        TableName: 'fdsaf',
      },
    };
    const result = await lambda.getAllCategories(event);
    const expectedResult = utils.send(StatusCodes.OK, []);
    expect(result).toEqual(expectedResult);
  });

  // Test-1 For getByKeyword
  it('should fail when keyword is empty', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        keyword: '',
      },
    };

    const { error } = schema.validate({ keyword: '' });

    const result = await lambda.getByKeyword(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: error.details.map((item) => item.message),
    });
    expect(result).toEqual(expectedResult);
  });

  // Test-2 For getByKeyword
  it('should fail when keyword is more than 50 words', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        keyword: jestCategoriesMock.keyword_upto_50,
      },
    };

    const { error } = schema.validate({ keyword: jestCategoriesMock.keyword_upto_50 });

    const result = await lambda.getByKeyword(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: error.details.map((item) => item.message),
    });
    expect(result).toEqual(expectedResult);
  });

  // Test-3 For getByKeyword
  it('should pass when keyword is defined', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        keyword: '2343',
      },
    };

    const result = await lambda.getByKeyword(event);
    const expectedResult = utils.send(StatusCodes.OK, []);
    expect(result).toEqual(expectedResult);
  });

  // Test-4 For getByKeyword
  it('should fail when pathParametrs is missing', async () => {
    const event = {
      httpMethod: 'GET',
    };

    const result = await lambda.getByKeyword(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Ops...',
    });
    expect(result).toEqual(expectedResult);
  });

  // Test-1 for getByCategories
  it('should fail when pathParametrs is missing', async () => {
    const event = {
      httpMethod: 'GET',
    };

    const result = await lambda.getByCategories(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Ops...',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when categories is empty', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        categories: '',
      },
    };

    const { error } = schema.validate({ categoryId: '' });
    const result = await lambda.getByCategories(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: error.details.map((item) => item.message),
    });
    expect(result).toEqual(expectedResult);
  });

  // Test-3 For getByKeyword
  // it('should fail when categories is more than 50 words', async () => {
  //   const event = {
  //     httpMethod: 'GET',
  //     pathParameters: {
  //       categories: jestCategoriesMock.categories_upto_50,
  //     },
  //   };

  //   const { error } = schema.validate({ categoryId: '' });
  //   const result = await lambda.getByCategories(event);
  //   const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
  //     errors: error.details.map((item) => item.message),
  //   });
  //   expect(result).toEqual(expectedResult);
  // });
});
