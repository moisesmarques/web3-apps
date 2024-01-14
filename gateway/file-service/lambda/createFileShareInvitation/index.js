const { StatusCodes } = require('http-status-codes');
const { v4: uuidV4 } = require('uuid');
const utils = require('../../utils');
const { verifyUser } = require('../../user');
const HttpError = require('../../error');
const Users = require('../../src/models/users');
const Wallets = require('../../src/models/wallets');
const Files = require('../../src/models/files');
const FileInvitations = require('../../src/models/files-invitation');
const { createFileSharteInvitationJoi } = require('../../src/lib/joiSchema');

module.exports.handler = async (event) => {
  // TODO: use a library that handles log sampling according to stage
  // console.log('event', JSON.stringify(event));

  const {
    pathParameters: { fileId, walletId },
    body,
  } = event;

  try {
    const { inviteeChannel, inviteeAddress, redirectUrl } = JSON.parse(body);
    const { error } = createFileSharteInvitationJoi.validate(JSON.parse(body), {
      abortEarly: false,
    });
    if (error) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'One or more fields are invalid.',
        data: error.details.map((item) => item.message),
      });
    }

    // verify user JWT
    await verifyUser(event);

    let userData;

    // check if user exists with given email or phone in near-users table
    if (inviteeChannel === 'email') {
      userData = await Users.getUserByEmail(inviteeAddress);
    }
    if (inviteeChannel === 'phone') {
      // expecting the number to be in format  "{countryCode}-{phoneNumber}"
      const phoneNumber = inviteeAddress.split('-')[1];
      userData = await Users.getUserByPhone(phoneNumber);
    }

    const file = await Files.getFile(walletId, fileId);
    if (!file) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `No file '${fileId}' associated with this wallet`,
      );
    }
    // if already exists assign the file to that specific user
    // by invoking grantAccessPermission lambda

    if (userData && userData.userId) {
      // get user walletId
      const inviteeWallet = await Wallets.getWalletByUserId(userData.userId);
      const sharedFile = await Files.upsertFile({
        ...file,
        ownerId: walletId,
        walletId: inviteeWallet.walletId,
        userId: userData.userId,
        acceptedAt: new Date().toISOString(),
        sharedAt: new Date().toISOString(),
      });
      return utils.send(StatusCodes.OK, { ...sharedFile });
    }

    // if not add a new entry to near-file-invitation using the schema mentioned in the comment https://growthlab.atlassian.net/browse/GWV2-784?focusedCommentId=15876
    const id = uuidV4();
    const invitationObject = {
      sk: `id=${id}#fileId=${fileId}`,
      fileId,
      ownerWalletId: walletId,
      name: file.name,
      id,
      redirectUrl,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (inviteeChannel === 'email') {
      invitationObject.pk = `FILE_INVITATION#email=${inviteeAddress}`;
      invitationObject.email = inviteeAddress;
    }
    if (inviteeChannel === 'phone') {
      invitationObject.pk = `FILE_INVITATION#phoneNumber=${inviteeAddress}`;
      invitationObject.phoneNumber = inviteeAddress;
    }
    const invitation = await FileInvitations.createInvitation(invitationObject);

    // send out email | SMS with the file link to the user
    if (inviteeChannel === 'email') {
      const FROM_EMAIL_ADDRESS = 'PrimeLab <do-not-reply@nearlogin.io>';
      await utils.sendEmail(
        inviteeAddress,
        FROM_EMAIL_ADDRESS,
        'Invitation to web3 file',
        // TODO: Remove static URL
        "You've been invited to a file, sign up and access on this link: https://sandbox.myweb3cloud.io/dashboard ",
      );
    }

    if (inviteeChannel === 'phone') {
      await utils.sendSMS(
        inviteeAddress,
        // TODO: Remove static URL
        "You've been invited to a file, sign up and access on this link: https://sandbox.myweb3cloud.io/dashboard ",
      );
    }

    return utils.send(StatusCodes.OK, {
      ...invitation,
    });
  } catch (e) {
    if (!e.status) {
      console.error(e.message, e);
    }
    return utils.send(
      e.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: e.message,
        data: e.data,
      },
      e,
    );
  }
};
