/* eslint-disable import/no-extraneous-dependencies */
import { APIGatewayProxyEvent } from 'aws-lambda';

/* eslint-disable import/no-extraneous-dependencies */
import { Handler, ParsedAPIGatewayProxyEvent } from '~types/Lambda';

export type LambdaHandler = Handler<
  APIGatewayProxyEvent,
  { message: string },
  { parsedEvent: ParsedAPIGatewayProxyEvent<{ receiverId: string }> }
>;
