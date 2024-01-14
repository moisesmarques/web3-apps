/* eslint-disable import/no-extraneous-dependencies */
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler } from 'aws-lambda';

export type LambdaHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;
