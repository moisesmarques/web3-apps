/* eslint-disable import/no-extraneous-dependencies */
import { Storage } from '@nearprime/gateway-data-model';
import { Handler } from '@nearprime/lambda-powertools-wrapper';

import { ParsedAPIGatewayProxyEvent } from '~types/Lambda';

export interface Response extends Storage.FileItem {
  publicUrl: string;
}

export interface Context {
  secretArn: {
    KeyPairId: string;
    PrivateKey: string;
  };
}

export type LambdaHandler = Handler<ParsedAPIGatewayProxyEvent<any>, Response, Context>;
