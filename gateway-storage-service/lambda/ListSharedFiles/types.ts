/* eslint-disable import/no-extraneous-dependencies */
import { Storage } from '@nearprime/gateway-data-model';
import { Handler } from '@nearprime/lambda-powertools-wrapper';
import { DynamoDB } from 'aws-sdk';

import { ParsedAPIGatewayProxyEvent } from '~types/Lambda';

export type LambdaHandler = Handler<
  ParsedAPIGatewayProxyEvent<any>,
  {
    filesShared: Storage.FileShare[];
    nextToken: DynamoDB.DocumentClient.Key | undefined;
  }
>;
