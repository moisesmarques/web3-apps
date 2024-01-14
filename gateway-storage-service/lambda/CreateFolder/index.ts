import 'source-map-support/register';

import docClient from '@nearprime/client-dynamodb';
import { HttpError } from '@nearprime/core';
import { Storage } from '@nearprime/gateway-data-model';
import httpParser from '@nearprime/lambda-middleware-http-parser';
import wrap from '@nearprime/lambda-powertools-wrapper';

import { LambdaHandler } from './types';

Storage.Folder.CLIENT = docClient;

export const lambdaHandler: LambdaHandler = async (event) => {
  const {
    body: { name, parentFolderId },
    pathParameters: { wId },
    identity: { wId: authWId },
  }: { [key: string]: any } = event;

  if (authWId !== wId) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.FORBIDDEN,
      message: 'You are not allowed to perform this action',
    });
  }

  // TODO Required Field Validation
  // TODO Validation that pathParameter wId belongs to loggedIn User

  if (parentFolderId) {
    const folder = await Storage.Folder.Get(wId, parentFolderId);
    if (!folder) {
      throw new HttpError({
        statusCode: HttpError.StatusCodes.NOT_FOUND,
        message: `No parent folder '${parentFolderId}' associated with this wallet`,
      });
    }
  }

  const existingFolders = await Storage.Folder.ListOwnedFoldersByWIdAndParentId(
    wId,
    parentFolderId,
  );
  const folderData: any[] = existingFolders.folders;
  if (folderData.some((el) => el.name === name)) {
    throw new HttpError({
      statusCode: HttpError.StatusCodes.CONFLICT,
      message: `Folder with name '${name}' already exists.`,
    });
  }

  return new Storage.Folder({ wId, parentFolderId, name }).save();
};

export const handler = wrap(lambdaHandler).use(httpParser());
