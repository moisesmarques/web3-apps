/* eslint-disable import/no-extraneous-dependencies */
import { Handler } from '@nearprime/lambda-powertools-wrapper';

import { ParsedAPIGatewayProxyEvent } from '~types/Lambda';

export type LambdaHandler = Handler<ParsedAPIGatewayProxyEvent<any>, { message: string }>;
