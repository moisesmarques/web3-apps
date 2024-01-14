// eslint-disable-next-line import/no-extraneous-dependencies
const DynamoDB = require('aws-sdk/clients/dynamodb');
const { nanoid } = require('nanoid');
const { StatusCodes } = require('http-status-codes');
const utils = require('./utils');
const { contactSchema } = require('./validation/schema');

const dynamo = new DynamoDB.DocumentClient();

module.exports.main = async (event) => {
  const reqId = nanoid();
  try {
    const { userId } = await utils.verifyAccessToken(event);
    const contactJSON = JSON.parse(event.body);

    if (!userId) {
      return utils.send(StatusCodes.UNAUTHORIZED, {
        message: 'Unauthorized',
      });
    }

    const { queryStringParameters: { email, id, phone } } = event;

    if (!email && !id && !phone) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'One of email, phone or id query parameter is required',
      });
    }

    if (id && !(await utils.walletExist(id))) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'Invalid near account. Please try again',
      });
    }

    if (email && !(await utils.emailExist(email))) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'Invalid near account. Please try again',
      });
    }

    if (phone && !(await utils.phoneExist(phone))) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'Invalid near account. Please try again',
      });
    }

    const { error } = contactSchema.validate(contactJSON, {
      abortEarly: false,
    });

    if (error) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: error.details.map((item) => item.message).join(', '),
        errors: error.details.map((item) => item.message),
      });
    }

    contactJSON.userId = userId;
    contactJSON.isFavorite = false;
    contactJSON.contactId = nanoid();

    await dynamo
      .put({
        TableName: 'near-contacts',
        Item: contactJSON,
      })
      .promise();

    console.log(`reqId: ${reqId}, msg: Contact added successfully!`);
    return utils.send(StatusCodes.CREATED, {
      message: 'Contact added successfully!',
      data: {
        contactJSON,
      },
    });
  } catch (err) {
    console.log(`reqId: ${reqId}, error: Error adding contacts to the user`);
    return utils.send(
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: 'Error adding contacts to the user!',
        data: err.message,
      },
      err,
    );
  }
};
