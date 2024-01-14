import 'source-map-support/register';

import secretsManager from '@middy/secrets-manager';
// eslint-disable-next-line import/no-extraneous-dependencies
import docClient from '@nearprime/client-dynamodb';
// eslint-disable-next-line import/no-extraneous-dependencies
import { HttpError } from '@nearprime/core';
import { Storage } from '@nearprime/gateway-data-model';
import httpParser from '@nearprime/lambda-middleware-http-parser';
import Log from '@nearprime/lambda-powertools-logger';
import wrap from '@nearprime/lambda-powertools-wrapper';
import * as Cloudfront from 'aws-sdk/clients/cloudfront';

import { LambdaHandler } from './types';

Storage.File.CLIENT = docClient;
const {
  SECRET_ARN_CLOUDFRONT_CDN_SIGNING_KEY = '',
  CLOUDFRONT_URL,
  SIGNED_URL_EXPIRATION = 60 * 15, // 15 minutes
  REGION,
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
      message: `You don't have permission to access this file`,
    });
  }

  const { secretArn } = context;

  // get file based on wallet ID and file ID
  const file = await Storage.File.Get(wId, fileId);

  // check if file exist, if not throw 404 error
  if (!file) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.NOT_FOUND,
      message: 'File not found',
    });
  }
  // Get signed url
  let filePath = `/storage/${wId}/${file.id}`;
  if (file.type) {
    filePath += `.${file.type}`;
  }

  const fileUrl = `https://${CLOUDFRONT_URL}${filePath}`;

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
  return { ...file, publicUrl };
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
