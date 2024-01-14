import 'source-map-support/register';

import secretsManager from '@middy/secrets-manager';
import docClient from '@nearprime/client-dynamodb';
import { HttpError } from '@nearprime/core';
import { Storage } from '@nearprime/gateway-data-model';
import httpParser from '@nearprime/lambda-middleware-http-parser';
import Log from '@nearprime/lambda-powertools-logger';
import wrap from '@nearprime/lambda-powertools-wrapper';
import * as Cloudfront from 'aws-sdk/clients/cloudfront';

import { LambdaHandler } from './types';

Storage.File.CLIENT = docClient;
Storage.Folder.CLIENT = docClient;

const {
  SECRET_ARN_CLOUDFRONT_CDN_SIGNING_KEY = '',
  CLOUDFRONT_URL,
  SIGNED_URL_EXPIRATION = 60 * 15, // 15 minutes
  REGION,
} = process.env;

export const lambdaHandler: LambdaHandler = async (event, context) => {
  const {
    body,
    pathParameters: { wId },
    identity: { wId: authWId },
  }: { [key: string]: any } = event;

  Log.debug('Received event', event);
  let folder: any;

  const { parentFolderId, name, storageProvider } = body;

  if (authWId !== wId) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.FORBIDDEN,
      message: 'You are not allowed to perform this action',
    });
  }

  // TODO Required Field Validation
  // TODO Validation that pathParameter wId belongs to loggedIn User

  if (parentFolderId) {
    folder = await Storage.Folder.Get(wId, parentFolderId);
    if (!folder) {
      throw new HttpError({
        statusCode: HttpError.StatusCodes.NOT_FOUND,
        message: `No parent folder '${parentFolderId}' associated with this wallet`,
      });
    }
  }

  const { secretArn } = context;

  const type = name.includes('.') ? name.split('.').pop() : null;
  const file = await new Storage.File({ wId, parentFolderId, name, storageProvider, type }).save();
  let fileUrl = `https://${CLOUDFRONT_URL}/storage/${wId}/${file.id}`;
  if (type) {
    fileUrl += `.${type}`;
  }
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
