// TODO: use alias to reference ~lib/ instead of ../../src/lib
const dynamodb = require('../lib/dynamodb');

const { TABLE_NAME_FILES_INVITATION } = process.env;

const createInvitation = async (invitationObject) => {
  await dynamodb
    .put({
      TableName: TABLE_NAME_FILES_INVITATION,
      Item: invitationObject,
    })
    .promise();
  return invitationObject;
};

const getInvitationsByEmail = async (email) => {
  const { Items } = await dynamodb
    .query({
      TableName: TABLE_NAME_FILES_INVITATION,
      ScanIndexForward: true,
      ConsistentRead: false,
      KeyConditionExpression: '#69240 = :69240',
      FilterExpression: '#9e501 = :9e501',
      ExpressionAttributeValues: {
        ':69240': `FILE_INVITATION#email=${email}`,
        ':9e501': 'pending',
      },
      ExpressionAttributeNames: {
        '#69240': 'pk',
        '#9e501': 'status',
      },
    })
    .promise();
  return Items;
};

const getInvitationsByPhoneNumber = async (phoneNumber) => {
  const { Items } = await dynamodb
    .query({
      TableName: TABLE_NAME_FILES_INVITATION,
      ScanIndexForward: true,
      ConsistentRead: false,
      KeyConditionExpression: '#69240 = :69240',
      FilterExpression: '#9e501 = :9e501',
      ExpressionAttributeValues: {
        ':69240': `FILE_INVITATION#phoneNumber=${phoneNumber}`,
        ':9e501': 'pending',
      },
      ExpressionAttributeNames: {
        '#69240': 'pk',
        '#9e501': 'status',
      },
    })
    .promise();
  return Items;
};

const updateInvitationStatus = async ({ pk, sk, status }) => {
  const { Attributes } = await dynamodb
    .update({
      TableName: TABLE_NAME_FILES_INVITATION,
      Key: {
        pk,
        sk,
      },
      UpdateExpression: 'SET #2fa80 = :2fa80',
      ExpressionAttributeValues: {
        ':2fa80': status,
      },
      ExpressionAttributeNames: {
        '#2fa80': 'status',
      },
    })
    .promise();
  return Attributes;
};

module.exports = {
  createInvitation,
  updateInvitationStatus,
  getInvitationsByEmail,
  getInvitationsByPhoneNumber,
};
