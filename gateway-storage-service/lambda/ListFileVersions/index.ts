import 'source-map-support/register';

import secretsManager from '@middy/secrets-manager';
import docClient from '@nearprime/client-dynamodb';
import { HttpError } from '@nearprime/core';
import { Storage } from '@nearprime/gateway-data-model';
import httpParser from '@nearprime/lambda-middleware-http-parser';
import Log from '@nearprime/lambda-powertools-logger';
import wrap from '@nearprime/lambda-powertools-wrapper';
import * as Cloudfront from 'aws-sdk/clients/cloudfront';
import S3 from 'aws-sdk/clients/s3';

import { LambdaHandler } from './types';

const s3 = new S3({ signatureVersion: 'v4' });

Storage.File.CLIENT = docClient;
const {
  SECRET_ARN_CLOUDFRONT_CDN_SIGNING_KEY = '',
  CLOUDFRONT_URL,
  SIGNED_URL_EXPIRATION = 60 * 15, // 15 minutes
  STORAGEBUCKET_NAME,
  REGION,
} = process.env;

export const lambdaHandler: LambdaHandler = async (event, context) => {
  Log.debug('Received event', event);
  const {
    pathParameters: { wId, fileId },
  }: { [key: string]: any } = event;

  // Using context to fetch secretARN using SecretManager middleware
  const { secretArn } = context;

  const file = await Storage.File.Get(wId, fileId);
  if (!file) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.NOT_FOUND,
      message: `File not found`,
      metadata: {
        fileId,
      },
    });
  }

  const type = file.type ? `.${file.type}` : null;

  const result = await s3
    .listObjectVersions({
      Bucket: STORAGEBUCKET_NAME || '',
      Prefix: `storage/${wId}/${fileId}${type}`,
    })
    .promise();
  const versions = result.Versions?.map((v) => {
    const { KeyPairId, PrivateKey } = secretArn;
    const signingParams = {
      keypairId: KeyPairId,
      privateKeyString: Buffer.from(PrivateKey, 'base64').toString('ascii'),
    };
    const signer: Cloudfront.Signer = new Cloudfront.Signer(
      signingParams.keypairId,
      signingParams.privateKeyString,
    );
    const filePath = `/storage/${wId}/${fileId}${type}?versionId=${v.VersionId}`;
    const fileUrl = `https://${CLOUDFRONT_URL}${filePath}`;
    const publicUrl = signer.getSignedUrl({
      url: fileUrl,
      expires: new Date().getTime() + +SIGNED_URL_EXPIRATION * 1000,
    });
    return { versionId: v.VersionId, publicURL: publicUrl };
  });
  return { fileId, versions: versions || [] };
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
