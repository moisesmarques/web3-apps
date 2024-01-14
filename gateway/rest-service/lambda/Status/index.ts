import 'source-map-support/register';

import Log from '@dazn/lambda-powertools-logger';
import wrap from '@nearprime/lambda-powertools-wrapper';

import { LambdaHandler } from './types';

export const lambdaHandler: LambdaHandler = async (event) => {
  Log.debug('Received event', event);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Up and running' }),
  };
};

export const handler = wrap(lambdaHandler);
