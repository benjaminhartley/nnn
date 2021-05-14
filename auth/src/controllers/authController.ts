import BigNumber from 'bignumber.js';

import userService from '../services/userService';

import { crypto, logger, uuid as uuidUtils } from 'bsh-shared-module';

import jwt from '../utils/jwt';

import { User } from '../interfaces';
import walletService from '../services/walletService';

const log = logger.getLogger();

interface SignupRequest {
  name: string;
  password: string;
  email?: string;
}

interface SignupResponse {
  userAccessToken: string;
  userRefreshToken: string;
}

async function handleSignup(
  signupRequest: SignupRequest,
): Promise<SignupResponse> {
  const { name, password } = signupRequest;

  // todo: better validation?
  validateName(name);
  validatePassword(password);

  const id = uuidUtils.createUuid();
  log.debug(`new user id: ${id}`);

  const hashedPassword = crypto.hashPassword(password);
  log.debug(hashedPassword);

  const depositAddress = await walletService.getNewAccount();

  const user: User = {
    name,
    password: hashedPassword,
    depositAddress,
    rawAmount: new BigNumber(0),
    id,
    createdAt: new Date().toISOString(),
  };

  if (signupRequest.email) {
    user.email = signupRequest.email;
  }

  await userService.saveUser(user);

  const userAccessToken = jwt.createUserToken(user);
  const userRefreshToken = jwt.createRefreshToken(user);

  return {
    userAccessToken,
    userRefreshToken,
  };
}

interface LoginRequest {
  name: string;
  password: string;
}

interface LoginResponse {
  userAccessToken: string;
  userRefreshToken: string;
}

async function handleLogin(loginRequest: LoginRequest): Promise<LoginResponse> {
  const { name, password } = loginRequest;
  const user = await userService.getUser(name);

  if (!user) {
    throw new Error('user not found');
  }

  log.debug(`got user ${user.name} in handleLogin`);

  const isCorrectPassword = crypto.comparePassword(password, user.password);
  if (!isCorrectPassword) {
    throw new Error('invalid password');
  }

  const userAccessToken = jwt.createUserToken(user);
  const userRefreshToken = jwt.createRefreshToken(user);

  return {
    userAccessToken,
    userRefreshToken,
  };
}

function validateName(name: string): void {
  if (name.length < 4 || name.length > 20) {
    throw new Error('invalid name length');
  }
}

function validatePassword(password: string): void {
  if (password.length < 10 || password.length > 128) {
    throw new Error('invalid password length');
  }
}

interface RefreshTokenResponse {
  userAccessToken: string;
  userRefreshToken: string;
}

async function refreshToken(token: string): Promise<RefreshTokenResponse> {
  const verifiedToken = jwt.verifyToken(token);
  const { name } = verifiedToken.user;

  const user = await userService.getUser(name);

  if (!user) {
    throw new Error('user not found');
  }

  const userAccessToken = jwt.createUserToken(user);

  return {
    userAccessToken,
    userRefreshToken: token,
  };
}

export default {
  handleLogin,
  handleSignup,
  refreshToken,
};
