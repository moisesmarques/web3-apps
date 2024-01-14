import 'source-map-support/register';

import docClient from '@nearprime/client-dynamodb';
import { HttpError } from '@nearprime/core';
import { Storage } from '@nearprime/gateway-data-model';
import lambdaMiddlewareHttpParser from '@nearprime/lambda-middleware-http-parser';
import Log from '@nearprime/lambda-powertools-logger';
import wrap from '@nearprime/lambda-powertools-wrapper';

import { LambdaHandler } from './types';

Storage.File.CLIENT = docClient;

export const lambdaHandler: LambdaHandler = async (event) => {
  Log.debug('Received event', event);
  const {
    pathParameters: { wId, fileId },
    identity: { wId: authWId },
  }: { [key: string]: any } = event;

  if (wId !== authWId) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.FORBIDDEN,
      message: `You don't have permission to delete this resource`,
    });
  }

  const file = await Storage.File.Delete(wId, fileId);

  if (!file) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.NOT_FOUND,
      message: 'File Not Found',
    });
  }
  return { message: 'File deleted successfully' };
};

export const handler = wrap(lambdaHandler).use(lambdaMiddlewareHttpParser());
