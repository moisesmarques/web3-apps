/* eslint-disable import/no-extraneous-dependencies */
import { APIGatewayProxyEventV2, Handler } from 'aws-lambda';
import { JwtPayload } from 'jsonwebtoken';

export interface ITokenPayload extends JwtPayload {
  created: number;
  status: 'active';
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  firstName: string;
  lastName: string;
  email: string;
  userId: string;
  walletName: string;
  iat: number;
  exp: number;
}

export interface ITokenError {
  type: string;
  message: string;
}

export type LambdaHandler = Handler<
  APIGatewayProxyEventV2,
  { isAuthorized: boolean; context: ITokenPayload | ITokenError }
>;
