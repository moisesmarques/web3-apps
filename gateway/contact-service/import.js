/* eslint-disable no-plusplus */
const BPromise = require('bluebird');
const { chunk, filter, map } = require('lodash');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const { nanoid } = require('nanoid');
const { StatusCodes } = require('http-status-codes');
const hash = require('object-hash');
const utils = require('./utils');
const { importSchema } = require('./validation/schema');

const dynamo = new DynamoDB.DocumentClient();

const { TABLE_NAME_CONTACTS = 'near-contacts' } = process.env;

function importContact(userId) {
  return async function (contact) {
    const { error } = await importSchema.validate(contact, utils.schemaOptions);

    if (error) {
      return {
        error: `${error.details.map((x) => x.message).toString()}`,
        contact,
      };
    }

    const [email = {}] = 'email' in contact ? contact.email : [];
    const [phone = {}] = 'phone' in contact ? contact.phone : [];

    if (!email.address && !phone.number) {
      return {
        error: 'One value is mandatory from email and phone',
      };
    }
    const data = {
      ...contact,
      userId,
      isFavorite: false,
    };
    const item = {
      ...data,
      contactId: hash(data, { algorithm: 'sha256', encoding: 'hex' }),
    };
    return {
      PutRequest: {
        Item: item,
      },
    };
  };
}

module.exports.main = async (event) => {
  const reqId = nanoid();
  try {
    const { userId } = event.pathParameters;
    const importArray = event && event.body ? JSON.parse(event.body) : [];
    if (!importArray.length) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'Body should not be empty.',
      });
    }

    if (!userId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'The path parameter "userId" is required.',
      });
    }
    // TODO: add further check to ensure userid is for the current user
    await utils.verifyAccessToken(event);
    const results = await BPromise.map(importArray, importContact(userId), {
      concurrency: 5,
    });
    const errors = filter(results, (r) => !!r.error);
    const putRequests = filter(results, (r) => !r.error);
    const putErrors = [];

    const contactsToImport = putRequests.reduce((acc, current) => {
      const x = acc.find((item) => item && item.PutRequest.Item.contactId === current.PutRequest.Item.contactId);

      if (!x) {
        return [...acc, current];
      }
      return acc;
    }, []);

    if (contactsToImport.length) {
      const batches = chunk(contactsToImport, 25); // Hard limit of batch requests in dynamodb
      await BPromise.map(
        batches,
        async (batch) => {
          const {
            UnprocessedItems: { [TABLE_NAME_CONTACTS]: unprocessedItems },
          } = await dynamo
            .batchWrite({
              RequestItems: {
                [TABLE_NAME_CONTACTS]: batch,
              },
            })
            .promise();
          if (unprocessedItems && unprocessedItems.length) {
            putErrors.push(...unprocessedItems);
          }
        },
        { concurrency: 5 },
      );
    }

    return utils.send(StatusCodes.OK, {
      message: 'Contacts imported.',
      data: {
        contactsImported: contactsToImport.length - putErrors.length,
        contactsNotImported: errors.length + putErrors.length,
        contactsWithError: map(errors, 'contact'),
        ...(errors.length + putErrors.length > 0
          ? { errorMessage: map(errors, 'error') }
          : {}),
      },
    });
  } catch (error) {
    console.log(`reqId: ${reqId}, error: Error importing contacts`, error);
    return utils.send(
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: 'Error importing contacts!',
        data: error.message,
      },
      error,
    );
  }
};
