import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API Handler for sign up
 * @param req request parameters
 * @param res response which returns token and email
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ token: '123', email: 'shahid@primelab.io' });
}
