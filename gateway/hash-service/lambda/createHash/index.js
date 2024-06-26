const { createFingerprint } = require('fprint');
const { v4: uuidv4 } = require('uuid');
const { StatusCodes } = require('http-status-codes');
const Hashes = require('../../src/models/hashes');
const HttpError = require('../../src/lib/error');
const http = require('../../src/lib/http');

module.exports.handler = async (event) => {
  try {
    const { input, algorithm = 'sha256' } = JSON.parse(event.body);

    const fingerprint = await createFingerprint(Buffer.from(input), algorithm);
    const id = uuidv4();
    const value = `${id.replace(/-/g, '')}${fingerprint}`;

    const {
      hk, sk, hk1, sk1, ...hash
    } = await Hashes.upsertHash(
      {
        id, fingerprint, algorithm, value,
      },
    );
    return http.send(StatusCodes.OK, hash);
  } catch (e) {
    return http.send(e.status || StatusCodes.INTERNAL_SERVER_ERROR, {
      message: e.message,
      data: e.data,
    });
  }
};
