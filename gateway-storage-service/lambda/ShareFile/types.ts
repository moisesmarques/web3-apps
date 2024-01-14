/* eslint-disable import/no-extraneous-dependencies */
import { Storage } from '@nearprime/gateway-data-model';
import { Handler } from '@nearprime/lambda-powertools-wrapper';

import { ParsedAPIGatewayProxyEvent } from '~types/Lambda';

export type LambdaHandler = Handler<
  ParsedAPIGatewayProxyEvent<{ receiverWId: string }>,
  Storage.FileShare
>;
