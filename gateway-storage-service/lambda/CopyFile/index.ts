import 'source-map-support/register';

import secretsManager from '@middy/secrets-manager';
import docClient from '@nearprime/client-dynamodb';
import { HttpError } from '@nearprime/core';
import { Storage, Wallet } from '@nearprime/gateway-data-model';
import httpParser from '@nearprime/lambda-middleware-http-parser';
import Log from '@nearprime/lambda-powertools-logger';
import wrap from '@nearprime/lambda-powertools-wrapper';
import * as Cloudfront from 'aws-sdk/clients/cloudfront';
import S3 from 'aws-sdk/clients/s3';

import { LambdaHandler } from './types';

Storage.File.CLIENT = docClient;
Wallet.Item.CLIENT = docClient;
const s3Client = new S3();

const {
  SECRET_ARN_CLOUDFRONT_CDN_SIGNING_KEY = '',
  CLOUDFRONT_URL,
  SIGNED_URL_EXPIRATION = 60 * 15, // 15 minutes
  REGION,
  BUCKET_NAME_STORAGE_DATA,
} = process.env;
export const lambdaHandler: LambdaHandler = async (event, context) => {
  Log.debug('Received event', event);
  const {
    pathParameters: { wId, fileId },
    identity: { wId: authWId },
  }: { [key: string]: any } = event;
  if (wId !== authWId) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.FORBIDDEN,
      message: 'You are not permitted to access this resource',
    });
  }

  const { secretArn } = context;

  const file = await Storage.File.Get(wId, fileId);
  if (!file) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.NOT_FOUND,
      message: `File '${fileId}' not found`,
      metadata: {
        requestId: context.awsRequestId,
      },
    });
  }
  // copy file in ddb
  const { name, parentFolderId, storageProvider, type } = file;
  const newFile = await new Storage.File({
    wId,
    parentFolderId,
    name: `copy_of_${name}`,
    storageProvider,
    type,
  }).save();

  // copy file in s3
  let key = `storage/${wId}/${newFile.id}`;
  let copySource = encodeURI(`/${BUCKET_NAME_STORAGE_DATA}/storage/${wId}/${file.id}`);

  if (file.type) {
    copySource += `.${file.type}`;
    key += `.${file.type}`;
  }
  // copy file
  await s3Client
    .copyObject({
      Bucket: BUCKET_NAME_STORAGE_DATA,
      CopySource: copySource,
      Key: key,
    })
    .promise();

  const fileUrl = `https://${CLOUDFRONT_URL}/${key}`;

  const { KeyPairId, PrivateKey } = secretArn;
  const signingParams = {
    keypairId: KeyPairId,
    privateKeyString: Buffer.from(PrivateKey, 'base64').toString('ascii'),
  };
  const signer: Cloudfront.Signer = new Cloudfront.Signer(
    signingParams.keypairId,
    signingParams.privateKeyString,
  );
  const publicUrl = signer.getSignedUrl({
    url: fileUrl,
    expires: new Date().getTime() + +SIGNED_URL_EXPIRATION * 1000,
  });
  return { ...newFile, publicUrl };
};

export const handler = wrap(lambdaHandler)
  .use(httpParser())
  .use(
    secretsManager({
      fetchData: {
        secretArn: SECRET_ARN_CLOUDFRONT_CDN_SIGNING_KEY,
      },
      awsClientOptions: {
        region: REGION,
      },
      setToContext: true,
    }),
  );
