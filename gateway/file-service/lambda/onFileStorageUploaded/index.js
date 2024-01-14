const BPromise = require('bluebird');
const { backOff } = require('exponential-backoff');
const Lambda = require('aws-sdk/clients/lambda');
const Files = require('../../src/models/files');

const lambda = new Lambda();

const { LAMBDA_FUNCTION_NAME_HASH_SERVICE_CREATE_HASH } = process.env;

async function generateHash(eTag) {
  const { Payload } = await lambda
    .invoke({
      FunctionName: LAMBDA_FUNCTION_NAME_HASH_SERVICE_CREATE_HASH,
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({
        body: JSON.stringify({
          input: eTag,
        }),
      }),
    })
    .promise();
  const { statusCode, body } = JSON.parse(Payload);
  if (statusCode !== 200) {
    throw new Error('Hashing file eTag failed');
  }
  const { value } = JSON.parse(body);
  return value;
}

/**
 * Update fileHash attribute in files table using S3 eTag associated with each file
 * @param {{[string]:*}} record - S3 event
 * @return {Promise<DocumentClient.AttributeMap>}
 */
async function updateFileHash(record) {
  const {
    s3: {
      object: { key, eTag, size },
    },
  } = record;
  // folder was undefined as i removed it for now, to make fe work, can add later
  // eslint-disable-next-line no-unused-vars
  const [walletId, __, fileId] = key.split('/'); // /walletId/root/fileId

  // Use exponential backoff to retry requests if they fail
  // defaultValues: numOfAttempts = 10, timeMultiple = 2
  return backOff(
    async () => {
      const hash = await generateHash(eTag);
      return Files.upsertFile(
        {
          fileId,
          walletId,
          hash,
          size,
          ttl: null,
        },
        'attribute_not_exists(#hash) OR #hash <> :hash',
      );
    },
    {
      numOfAttempts: 2,
      retry: (error, attemptNumber) => {
        console.warn(`Attempt #${attemptNumber} error:`, error);
        return true;
      },
    },
  );
}

// TODO: implement onFileUploaded
module.exports.handler = async (event) => {
  console.log('onFileStorageUpload Event', JSON.stringify(event));
  // TODO: use a library that handles log sampling according to stage
  // console.log('event', JSON.stringify(event));
  const { Records } = event;
  // limit to 5 concurrent updates to hot partition issue with files table
  return BPromise.map(Records, updateFileHash, { concurrency: 5 });
};
