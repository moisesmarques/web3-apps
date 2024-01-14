const dynamodb = require('../lib/dynamodb');

const { TABLE_NAME_USERS } = process.env;

/**
 * Retrieve a user using userId
 * @param {string} userId - user id to retrieve
 * @return {Promise<DocumentClient.AttributeMap>}
 */
async function getUser(userId) {
  const { Item } = await dynamodb
    .get({
      TableName: TABLE_NAME_USERS,
      Key: {
        userId,
      },
    })
    .promise();
  return Item;
}

const getUserByEmail = async (email) => {
  const { Items } = await dynamodb
    .query({
      TableName: TABLE_NAME_USERS,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    })
    .promise();
  return Items[0];
};

const getUserByPhone = async (phone) => {
  const { Items } = await dynamodb
    .query({
      TableName: TABLE_NAME_USERS,
      IndexName: 'PhoneIndex',
      KeyConditionExpression: 'phone = :phone',
      ExpressionAttributeValues: {
        ':phone': phone,
      },
    })
    .promise();
  return Items[0];
};

module.exports = {
  getUser,
  getUserByEmail,
  getUserByPhone,
};
