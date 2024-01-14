import 'source-map-support/register';

import sts from '@middy/sts';
// import docClient from '@nearprime/client-dynamodb';
import docClient, { enhanceClient } from '@nearprime/client-dynamodb';
import { HttpError } from '@nearprime/core';
import { Storage, Wallet } from '@nearprime/gateway-data-model';
import httpParser from '@nearprime/lambda-middleware-http-parser';
// import Log from '@nearprime/lambda-powertools-logger';
import wrap from '@nearprime/lambda-powertools-wrapper';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import S3 from 'aws-sdk/clients/s3';

import { LambdaHandler } from './types';

Storage.File.CLIENT = docClient;
Wallet.Item.CLIENT = docClient;
const s3Client = new S3();
const {
  BUCKET_NAME_STORAGE_DATA,
  IAM_ROLE_ARN_WALLET_CROSS_ACCOUNT = '',
  AWS_REGION = 'us-east-1',
} = process.env;

let walletsClient: DynamoDB.DocumentClient;

export const lambdaHandler: LambdaHandler = async (event, context) => {
  const {
    body,
    pathParameters: { wId, fileId },
  }: { [key: string]: any } = event;

  const { walletCrossAccountCredentials } = context;
  if (!walletsClient) {
    walletsClient = enhanceClient(
      new DynamoDB.DocumentClient({
        region: AWS_REGION,
        credentials: walletCrossAccountCredentials,
      }),
    );
    Wallet.Item.CLIENT = walletsClient;
  }

  // TO DO check user
  // TO DO check user against walletId provided

  if (!body) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.BAD_REQUEST,
      message: 'No body in request',
      metadata: {
        requestId: context.awsRequestId,
      },
    });
  }
  const { receiverId } = body;

  if (!receiverId) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.BAD_REQUEST,
      message: 'ReceiverId must be provided',
      metadata: {
        requestId: context.awsRequestId,
      },
    });
  }

  if (receiverId === wId) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.BAD_REQUEST,
      message: `Owner and Receiver wallets are same ${receiverId}`,
      metadata: {
        requestId: context.awsRequestId,
      },
    });
  }

  const receiverWallet = await Wallet.Item.Get(receiverId);
  if (receiverWallet?.wId !== receiverId) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.BAD_REQUEST,
      message: `Receiver wallet '${receiverId}' does not exists`,
      metadata: {
        requestId: context.awsRequestId,
      },
    });
  }
  const file = await Storage.File.Get(wId, fileId);
  // check if file exist, if not throw 404 error
  if (!file) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.NOT_FOUND,
      message: `File '${fileId}' not found`,
      metadata: {
        requestId: context.awsRequestId,
      },
    });
  }

  let key = `storage/${receiverId}/${file.id}`;
  let copySource = encodeURI(`/${BUCKET_NAME_STORAGE_DATA}/storage/${wId}/${file.id}`);
  let deleteKey = `storage/${wId}/${file.id}`;
  if (file.type) {
    copySource += `.${file.type}`;
    key += `.${file.type}`;
    deleteKey += `.${file.type}`;
  }
  // copy file from wId to receiverId
  await s3Client
    .copyObject({
      Bucket: BUCKET_NAME_STORAGE_DATA,
      CopySource: copySource,
      Key: key,
    })
    .promise();

  // delete original file
  await s3Client
    .deleteObject({
      Bucket: BUCKET_NAME_STORAGE_DATA,
      Key: deleteKey,
    })
    .promise();

  const updated = file.clone({ wId: receiverId, ownerWId: receiverId });
  await Storage.File.Delete(wId, file.id);
  await updated.save();

  return { message: `File Ownership transfered from '${wId}' to '${receiverId}'` };
};

export const handler = wrap(lambdaHandler)
  .use(httpParser())
  .use(
    sts({
      setToContext: true,
      fetchData: {
        // @ts-ignore - this is an issue with @middy/sts
        walletCrossAccountCredentials: {
          RoleArn: IAM_ROLE_ARN_WALLET_CROSS_ACCOUNT,
        },
      },
    }),
  );
