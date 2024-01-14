/* eslint-disable import/no-extraneous-dependencies */
import { Handler } from '@nearprime/lambda-powertools-wrapper';

import { ParsedAPIGatewayProxyEvent } from '~types/Lambda';

export interface Response {
  fileId: string;
  versions: {
    versionId?: string;
    publicURL: string;
  }[];
}

export interface Context {
  secretArn: {
    KeyPairId: string;
    PrivateKey: string;
  };
}

export type LambdaHandler = Handler<ParsedAPIGatewayProxyEvent<any>, Response, Context>;
