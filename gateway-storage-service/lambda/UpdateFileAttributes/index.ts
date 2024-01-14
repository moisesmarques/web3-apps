import 'source-map-support/register';

import docClient from '@nearprime/client-dynamodb';
import { HttpError } from '@nearprime/core';
import { Storage } from '@nearprime/gateway-data-model';
import httpParser from '@nearprime/lambda-middleware-http-parser';
import Log from '@nearprime/lambda-powertools-logger';
import wrap from '@nearprime/lambda-powertools-wrapper';

import { LambdaHandler } from './types';

Storage.File.CLIENT = docClient;
Storage.Folder.CLIENT = docClient;

export const lambdaHandler: LambdaHandler = async (event,context) => {
  const {
    parsedEvent: {
      body,
      pathParameters: { wId, fileId },
    },
  }: { [key: string]: any } = context;

  Log.debug('Received context', context);

  const { parentFolderId , name} = body;

  // TODO Validation of User
  // TODO Required Field Validation
  // TODO Validation that pathParameter wId belongs to loggedIn User

  // check if Parent Folder exist or not
  if (parentFolderId) {
    const pFolder = await Storage.Folder.Get(wId, parentFolderId);

    if (!pFolder) {
      throw new HttpError({
        statusCode: HttpError.StatusCodes.NOT_FOUND,
        message: `No parent folder '${parentFolderId}' associated with this wallet`,
      });
    }
  }

  if (!body) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.BAD_REQUEST,
      message: `Bad request`,
    });
  }

  const file: Storage.FileData | null = await Storage.File.Get(wId, fileId);

  if(name) {
    body.type = name.includes('.') ? name.split('.').pop() : null;
  }

  if (!file) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.NOT_FOUND,
      message: `File '${fileId}' not found.`,
    });
  }

  return file.clone(body).save();

};

export const handler = wrap(lambdaHandler).use(httpParser());
