/* eslint-disable import/no-extraneous-dependencies */
import { Storage } from '@nearprime/gateway-data-model';
import { APIGatewayProxyEvent } from 'aws-lambda';

import { Handler } from '~types/Lambda';

export interface Response extends Storage.FileItem {
  publicUrl: string;
}

export interface Context {
  secretArn: {
    KeyPairId: string;
    PrivateKey: string;
  };
}

export type LambdaHandler = Handler<APIGatewayProxyEvent, Response, Context>;
