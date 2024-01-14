/* eslint-disable import/no-extraneous-dependencies */
import { Storage } from '@nearprime/gateway-data-model';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

import { Handler } from '~types/Lambda';

export type LambdaHandler = Handler<
  APIGatewayProxyEvent,
  {
    folders: Storage.Folder[];
    nextToken: DynamoDB.DocumentClient.Key | undefined;
  }
>;
