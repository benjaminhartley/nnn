import jwt from 'jsonwebtoken';

import { User } from '../interfaces';

import secret from '../utils/secret';

function createUserToken(user: User): string {
  return jwt.sign(
    {
      user: {
        id: user.id,
        name: user.name,
      },
    },
    secret.getSecret(),
    {
      expiresIn: '3h',
      issuer: 'nnn',
    },
  );
}

function createRefreshToken(user: User): string {
  return jwt.sign(
    {
      user: {
        id: user.id,
        name: user.name,
      },
    },
    secret.getSecret(),
    {
      expiresIn: '7d',
      issuer: 'nnn',
    },
  );
}

function verifyToken(token: string): any {
  return jwt.verify(token, secret.getSecret());
}

export default {
  createRefreshToken,
  createUserToken,
  verifyToken,
};
