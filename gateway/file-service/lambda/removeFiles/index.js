const S3 = require('aws-sdk/clients/s3');
const Version = require('../../src/lib/versioning');

const { BUCKET_NAME_FILES } = process.env;

const s3 = new S3({ signatureVersion: 'v4' });

module.exports.handler = async (event) => {
  console.log(event);

  const walletId = event.Records[0].dynamodb.OldImage.ownerId.S;
  const fileId = event.Records[0].dynamodb.OldImage.fileId.S;
  const version = event.Records[0].dynamodb.OldImage.version.S;
  const name = event.Records[0].dynamodb.OldImage.name.S;
  const folderId = event.Records[0].dynamodb.OldImage.folderId.S || 'root';
  try {
    let Key;
    switch (version) {
      case Version.v1:
        Key = `${walletId}/${folderId}/${fileId}`;
        break;

      default:
        Key = `${walletId}/${folderId}/${fileId}_${name}`;
        break;
    }
    const params = {
      Bucket: BUCKET_NAME_FILES,
      Key,
    };

    await s3.deleteObject(params).promise();
  } catch (e) {
    console.error(e);
  }
};
