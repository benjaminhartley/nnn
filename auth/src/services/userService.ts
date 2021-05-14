import BigNumber from 'bignumber.js';

import { User } from '../interfaces';

import { logger } from 'bsh-shared-module';
import utils from './utils';

const log = logger.getLogger();

async function saveUser(user: User): Promise<void> {
  const pool = utils.getPool();
  const client = await pool.connect();

  const values = [
    user.name,
    user.id,
    user.password,
    user.email || null,
    user.depositAddress,
    user.rawAmount.toFixed(),
    user.createdAt,
  ];

  log.debug(values);

  try {
    const res = await client.query(
      'INSERT INTO users (name, id, password, email, deposit_address, balance, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      values,
    );

    log.debug(res);
    client.release();
  } catch (e) {
    client.release();
    log.error('error saving user:', e);
    log.error(e.message, e.code);

    if (e.code.toString() === '23505') {
      throw new Error('user already exists');
    }

    throw new Error('error saving user');
  }
}

async function getUser(name: string): Promise<User | null> {
  const pool = utils.getPool();
  const client = await pool.connect();

  try {
    const res = await client.query(
      'SELECT name, id, password, email, deposit_address, balance, created_at FROM users WHERE name = ($1)',
      [name],
    );

    log.debug(res.rows);
    client.release();

    if (!res?.rows?.[0]) {
      return null;
    }

    return formatRawUser(res.rows[0]);
  } catch (e) {
    client.release();
    log.error(e);
    throw new Error('error getting user');
  }
}

function formatRawUser(data: any): User {
  const user: User = {
    name: data.name,
    id: data.id,
    createdAt: data.created_at,
    password: data.password,
    rawAmount: new BigNumber(data.balance),
  };

  if (data.email) {
    user.email = data.email;
  }

  if (data.deposit_address) {
    user.depositAddress = data.deposit_address;
  }

  return user;
}

async function incrementBalance(
  depositAddress: string,
  depositAmount: BigNumber,
): Promise<void> {
  const pool = utils.getPool();
  const client = await pool.connect();

  try {
    const res = await client.query(
      'UPDATE users SET balance = CAST (balance as NUMERIC) + CAST ($1 as NUMERIC) WHERE deposit_address = $2',
      [depositAmount.toFixed(), depositAddress],
    );

    log.debug(res);
    client.release();
  } catch (e) {
    client.release();
    log.error(e);
    throw new Error('error incrementing user balance');
  }
}

async function decrementBalance(
  name: string,
  withdrawalAmount: BigNumber,
): Promise<BigNumber> {
  const pool = utils.getPool();
  const client = await pool.connect();

  try {
    const res = await client.query(
      'UPDATE users SET balance = CAST (balance as NUMERIC) - CAST ($1 as NUMERIC) WHERE name = $2 RETURNING balance',
      [withdrawalAmount.toFixed(), name],
    );

    log.debug(res.rows);
    client.release();
    return new BigNumber(res.rows[0].balance);
  } catch (e) {
    client.release();
    log.error(e);
    throw new Error('error decrementing user balance');
  }
}

export default {
  getUser,
  saveUser,
  decrementBalance,
  incrementBalance,
};
