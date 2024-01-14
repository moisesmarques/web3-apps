import 'source-map-support/register';

import docClient from '@nearprime/client-dynamodb';
import { HttpError } from '@nearprime/core';
import { Storage } from '@nearprime/gateway-data-model';
import lambdaMiddlewareHttpParser from '@nearprime/lambda-middleware-http-parser';
import Log from '@nearprime/lambda-powertools-logger';
import wrap from '@nearprime/lambda-powertools-wrapper';

import { LambdaHandler } from './types';

Storage.FileShare.CLIENT = docClient;

export const lambdaHandler: LambdaHandler = async (event) => {
  Log.debug('Received event', event);
  const {
    pathParameters: { wId, fileId },
    body: { sharedWId },
    identity: { wId: authWId },
  }: { [key: string]: any } = event;

  if (wId !== authWId) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.FORBIDDEN,
      message: `You are not allowed to perform this action`,
    });
  }

  const fileShare = await Storage.FileShare.Delete(sharedWId, fileId);
  if (!fileShare) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.NOT_FOUND,
      message: `File '${fileId}' shared to wallet ID '${sharedWId}' not found.`,
    });
  }
  return { message: 'File UnShared successfully' };
};

export const handler = wrap(lambdaHandler).use(lambdaMiddlewareHttpParser());
