import 'source-map-support/register';

import docClient from '@nearprime/client-dynamodb';
import { HttpError } from '@nearprime/core';
import { Storage } from '@nearprime/gateway-data-model';
import httpParser from '@nearprime/lambda-middleware-http-parser';
import Log from '@nearprime/lambda-powertools-logger';
import wrap from '@nearprime/lambda-powertools-wrapper';

import { LambdaHandler } from './types';

Storage.Folder.CLIENT = docClient;

export const lambdaHandler: LambdaHandler = async (event, context) => {
  const {
    parsedEvent: {
      body,
      pathParameters: { wId, folderId },
    },
  }: { [key: string]: any } = context;

  Log.debug('Received context', context);

  const { parentFolderId } = body;

  // TODO Validation of User
  // TODO Required Field Validation
  // TODO Validation that pathParameter wId belongs to loggedIn User

  // check if Parent Folder og given folderId exist or not
  if (parentFolderId) {
    const pFolder = await Storage.Folder.Get(wId, parentFolderId);
    if (!pFolder) {
      throw new HttpError({
        statusCode: HttpError.StatusCodes.NOT_FOUND,
        message: `No parent folder '${parentFolderId}' associated with this wallet`,
      });
    }
  }

  // check if given folderId exist or not
  const folder = await Storage.Folder.Get(wId, folderId);
  if (!folder) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.NOT_FOUND,
      message: `No folder '${folderId}' associated with this wallet`,
    });
  }

  return folder.clone(body).save();
};

export const handler = wrap(lambdaHandler).use(httpParser());
