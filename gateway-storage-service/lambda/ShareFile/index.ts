import 'source-map-support/register';

import sts from '@middy/sts';
import docClient, { enhanceClient } from '@nearprime/client-dynamodb';
import { HttpError } from '@nearprime/core';
import { Storage, Wallet } from '@nearprime/gateway-data-model';
import httpParser from '@nearprime/lambda-middleware-http-parser';
import Log from '@nearprime/lambda-powertools-logger';
import wrap from '@nearprime/lambda-powertools-wrapper';
import DynamoDB from 'aws-sdk/clients/dynamodb';

import { LambdaHandler } from './types';

const { IAM_ROLE_ARN_WALLET_CROSS_ACCOUNT = '', AWS_REGION = 'us-east-1' } = process.env;

Storage.File.CLIENT = docClient;
Storage.FileShare.CLIENT = docClient;
Wallet.Item.CLIENT = docClient;
let walletsClient: DynamoDB.DocumentClient;

export const lambdaHandler: LambdaHandler = async (event, context) => {
  Log.debug('Received event', event);
  const {
    pathParameters: { wId, fileId },
    body: { receiverWId },
    identity: { wId: authWId },
  }: { [key: string]: any } = event;

  if (wId !== authWId) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.FORBIDDEN,
      message: `You are not allowed to perform this action`,
    });
  }

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
  // TODO - Verify if walletId belongs to the user using JWT token details

  const receiverWallet = await Wallet.Item.Get(receiverWId);
  if (receiverWallet?.wId !== receiverWId) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.NOT_FOUND,
      message: `Receiver wallet does not exists`,
      metadata: {
        requestId: context.awsRequestId,
        receiverWId,
      },
    });
  }

  const file = await Storage.File.Get(wId, fileId);

  Log.debug('File', file);

  if (!file) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.NOT_FOUND,
      message: 'File not found',
      metadata: { fileId },
    });
  }

  return new Storage.FileShare({ ownerWId: wId, id: fileId, wId: receiverWId }).save();
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
