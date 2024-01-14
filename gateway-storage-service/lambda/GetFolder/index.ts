import 'source-map-support/register';

import docClient from '@nearprime/client-dynamodb';
import { HttpError } from '@nearprime/core';
import { Storage } from '@nearprime/gateway-data-model';
import lambdaMiddlewareHttpParser from '@nearprime/lambda-middleware-http-parser';
import Log from '@nearprime/lambda-powertools-logger';
import wrap from '@nearprime/lambda-powertools-wrapper';

import { LambdaHandler } from './types';

Storage.Folder.CLIENT = docClient;

export const lambdaHandler: LambdaHandler = async (event) => {
  Log.debug('Received event', event);
  const {
    pathParameters: { wId, folderId },
    identity: { wId: authWId },
  }: { [key: string]: any } = event;

  if (wId !== authWId) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.FORBIDDEN,
      message: `You don't have permission to access this folder`,
    });
  }
  const folder = await Storage.Folder.Get(wId, folderId);

  if (!folder) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.NOT_FOUND,
      message: 'Folder Not Found',
    });
  }
  return folder;
};

export const handler = wrap(lambdaHandler).use(lambdaMiddlewareHttpParser());
