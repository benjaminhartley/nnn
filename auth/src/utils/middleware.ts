import express from 'express';

import { logger } from 'bsh-shared-module';

import jwt from '../utils/jwt';

import { RequestWithToken } from '../interfaces';

const log = logger.getLogger();

function authMiddleware(
  req: RequestWithToken,
  res: express.Response,
  next: express.NextFunction,
): any {
  const token = getAuthorizerToken(req.headers);

  if (!token) {
    log.info('missing Authorization header');
    res.status(401);
    return res.json({
      code: 'UNAUTHORIZED',
      errorMessage: 'Unauthorized',
    });
  }

  try {
    const verifiedToken = jwt.verifyToken(token);
    log.debug(verifiedToken);

    req.token = verifiedToken;

    next();
  } catch (e) {
    log.error(e);
    res.status(401);
    return res.json({
      code: 'UNAUTHORIZED',
      errorMessage: 'Unauthorized',
    });
  }
}

function getAuthorizerToken(headers: {
  [key: string]: string | string[];
}): string | null {
  return (
    (headers.Authorization && headers.Authorization.toString()) ||
    (headers.authorization && headers.authorization.toString()) ||
    null
  );
}

export default {
  authMiddleware,
};
