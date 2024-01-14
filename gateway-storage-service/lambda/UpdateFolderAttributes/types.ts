/* eslint-disable import/no-extraneous-dependencies */
import { Storage } from '@nearprime/gateway-data-model';
import { APIGatewayProxyEvent } from 'aws-lambda';

import { Handler, ParsedAPIGatewayProxyEvent } from '~/types/Lambda';

export type LambdaHandler = Handler<
  APIGatewayProxyEvent,
  Storage.Folder,
  { parsedEvent: ParsedAPIGatewayProxyEvent<Storage.Folder> }
>;
