import 'source-map-support/register';

import docClient from '@nearprime/client-dynamodb';
import { HttpError } from '@nearprime/core';
import { Storage } from '@nearprime/gateway-data-model';
import lambdaMiddlewareHttpParser from '@nearprime/lambda-middleware-http-parser';
import Log from '@nearprime/lambda-powertools-logger';
import wrap from '@nearprime/lambda-powertools-wrapper';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Key } from 'aws-sdk/clients/dynamodb';

import { LambdaHandler } from './types';

Storage.FileShare.CLIENT = docClient;

export const lambdaHandler: LambdaHandler = async (event) => {
  Log.debug('Received event', event);
  const {
    pathParameters: { wId },
    identity: { wId: authWId },
    queryStringParameters,
  }: { [key: string]: any } = event;

  if (wId !== authWId) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.FORBIDDEN,
      message: `You are not allowed to perform this action`,
    });
  }

  const lastEvaluatedKey: Key | undefined = queryStringParameters
    ? queryStringParameters.lastEvaluatedKey
    : undefined;

  return Storage.FileShare.ListOwnedSharedFiles(wId, lastEvaluatedKey);
};

export const handler = wrap(lambdaHandler).use(lambdaMiddlewareHttpParser());