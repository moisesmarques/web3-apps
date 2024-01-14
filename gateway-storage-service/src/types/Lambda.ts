/* eslint-disable import/no-extraneous-dependencies */
import { APIGatewayProxyEvent } from 'aws-lambda';

export { Handler } from '@nearprime/lambda-powertools-wrapper';

export interface ParsedAPIGatewayProxyEvent<TBody>
  extends Omit<APIGatewayProxyEvent, 'body' | 'pathParameters'> {
  body: TBody;
  pathParameters: { [key: string]: string };
  identity: {
    userId: string;
    wId: string;
  };
}
