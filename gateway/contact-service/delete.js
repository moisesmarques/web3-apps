const DynamoDB = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const utils = require('./utils');

const dynamo = new DynamoDB.DocumentClient();

const getContact = async (contactId) => {
  const { Item } = await dynamo
    .get({
      TableName: 'near-contacts',
      Key: {
        contactId,
      },
    })
    .promise();
  return Item;
};

module.exports.main = async (event) => {
  try {
    const { body } = event;
    if (!body) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'Payload is required',
      });
    }
    const { contactIds } = JSON.parse(body);
    if (!contactIds) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'Parameter "contactIds" is required in payload.',
      });
    }
    if (!Array.isArray(contactIds)) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: '"contactIds" should be a valid array',
      });
    }
    const { userId } = await utils.verifyAccessToken(event);
    const deleteResponse = {
      success: 0,
      error: 0,
      notFound: 0,
      unauthorized: 0,
    };
    await Promise.all(
      contactIds.map(async (contactId) => {
        // TODO: Ian: add verification to ensure that a user deletes only his/her contacts
        // IDEA: Ian: fetch contact information then compare current user (from token) with contact user
        // TODO: Ian: check if contact exists before deleting -- resolved (save compute by catching delete error)
        try {
          return getContact(contactId).then(async (contact) => {
            if (contact) {
              if (contact.userId === userId) {
                await dynamo
                  .delete({
                    TableName: 'near-contacts',
                    Key: { contactId },
                    ConditionExpression: 'attribute_exists(contactId)',
                  })
                  .promise();
                ++deleteResponse.success;
                return;
              }
              ++deleteResponse.unauthorized;
              return;
            }
            ++deleteResponse.notFound;
          });
        } catch (e) {
          if (e.code === 'ConditionalCheckFailedException') {
            ++deleteResponse.notFound;
          }
          ++deleteResponse.error;
        }
      }),
    );
    return utils.send(StatusCodes.OK, {
      message: `${
        deleteResponse.success > 0
          ? `${deleteResponse.success} contact${
            deleteResponse.success === 1 ? '' : 's'
          } deleted successfully. `
          : ''
      }${
        deleteResponse.notFound > 0
          ? `${deleteResponse.notFound} contact${
            deleteResponse.notFound === 1 ? ' was' : 's were'
          } not found. `
          : ''
      }${
        deleteResponse.unauthorized > 0
          ? `${deleteResponse.unauthorized} contact${
            deleteResponse.unauthorized === 1 ? ' was' : 's were'
          } not authorized.`
          : ''
      }`,
      data: deleteResponse,
    });
  } catch (error) {
    return utils.send(
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: 'Error deleting contacts to the user!',
        data: error.message,
      },
      error,
    );
  }
};
