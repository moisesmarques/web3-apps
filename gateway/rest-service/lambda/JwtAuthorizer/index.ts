import 'source-map-support/register';

import Log from '@dazn/lambda-powertools-logger';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import wrap from '@nearprime/lambda-powertools-wrapper';
import { NotBeforeError, TokenExpiredError, verify } from 'jsonwebtoken';

import { ITokenPayload, LambdaHandler } from './types';

const SECRET_KEY = 'MyAwesomeKey';

export const lambdaHandler: LambdaHandler = async (event) => {
  Log.debug('Received event', event);
  const {
    headers: { authorization },
  } = event;
  if (!authorization) {
    return {
      isAuthorized: false,
      context: {
        type: 'TokenUndefinedError',
        message: 'missing jwt token',
      },
    };
  }

  try {
    const identity = verify(
      `Bearer ${authorization.replace('Bearer ', '')}`,
      SECRET_KEY,
    ) as ITokenPayload;
    return {
      isAuthorized: true,
      context: identity,
    };
  } catch (err: any) {
    if (err instanceof TokenExpiredError) {
      Log.debug(`Token expired at ${new Date(err.expiredAt).toUTCString()}`);
      return {
        isAuthorized: false,
        context: {
          message: `Token expired at ${new Date(err.expiredAt).toUTCString()}`,
          type: 'TokenExpiredError',
        },
      };
    }

    if (err instanceof NotBeforeError) {
      Log.debug(`Token starts at ${new Date(err.date).toUTCString()}`);
      return {
        isAuthorized: false,
        context: {
          message: `Token starts at ${new Date(err.date).toUTCString()}`,
          type: 'NotBeforeError',
        },
      };
    }

    return {
      isAuthorized: false,
      context: {
        type: 'InvalidToken',
        message: `Invalid token`,
      },
    };
  }
};

export const handler = wrap(lambdaHandler).use(httpHeaderNormalizer()); // Make sure authorization header is saved in lower case;
