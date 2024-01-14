const BPromise = require('bluebird');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const { assign } = require('lodash');
const Files = require('../../src/models/files');
const Users = require('../../src/models/users');
const FileInvitations = require('../../src/models/files-invitation');

const parse = DynamoDB.Converter.unmarshall;

const processRecord = (record) => {
  const { dynamodb, eventName } = record;
  const { walletId, userId } = parse(dynamodb.NewImage);
  return { walletId, userId, eventName };
};

async function assignFilesInvitedTo(item) {
  // get user by user ID
  let isEmailRegistered = false;
  const invitations = [];
  const { userId, walletId } = item;
  const { email, phone, countryCode } = await Users.getUser(userId);
  if (email) isEmailRegistered = true;
  if (!isEmailRegistered) {
    const invitations = await FileInvitations.getInvitationsByPhoneNumber(
      `${countryCode}-${phone}`,
    );
    await BPromise.map(invitations, async (invitation) => {
      const { fileId, ownerWalletId, id } = invitation;
      const file = await Files.getFile(ownerWalletId, fileId);
      // share file with the invitee
      await Files.upsertFile({
        ...file,
        ownerId: ownerWalletId,
        walletId,
        userId,
        acceptedAt: new Date().toISOString(),
        sharedAt: new Date().toISOString(),
      });

      // update invitation status to completed
      await FileInvitations.updateInvitationStatus({
        pk: `FILE_INVITATION#phoneNumber=${countryCode}-${phone}`,
        sk: `id=${id}#fileId=${fileId}`,
        status: 'completed',
      }); w;
    });
  }
  if (isEmailRegistered) {
    const invitations = await FileInvitations.getInvitationsByEmail(email);
    await BPromise.map(invitations, async (invitation) => {
      const { fileId, ownerWalletId, id } = invitation;
      const file = await Files.getFile(ownerWalletId, fileId);
      // share file with the invitee
      await Files.upsertFile({
        ...file,
        ownerId: ownerWalletId,
        walletId,
        userId,
        acceptedAt: new Date().toISOString(),
        sharedAt: new Date().toISOString(),
      });

      // update invitation status to completed
      await FileInvitations.updateInvitationStatus({
        pk: `FILE_INVITATION#email=${email}`,
        sk: `id=${id}#fileId=${fileId}`,
        status: 'completed',
      });
    });
  }
  //   const invitations = await FileInvitations.g
}

// TODO: implement onFileUploaded
module.exports.handler = async (event) => {
  // TODO: use a library that handles log sampling according to stage
  console.log('event', JSON.stringify(event));
  const { Records } = event;
  // limit to 5 concurrent updates to hot partition issue with files table
  return BPromise.map(
    Records,
    async (record) => {
      const item = processRecord(record);
      switch (true) {
        case item.eventName === 'INSERT' && !!item.userId: // A file has been shared and accepted
          return await assignFilesInvitedTo(item);
        default:
          console.warn('Dynamodb event unhandled');
      }
      return item;
      // return sendTransaction(trx);
    },
    { concurrency: 5 },
  );
};
