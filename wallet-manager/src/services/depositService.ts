import BigNumber from 'bignumber.js';

import { logger } from 'bsh-shared-module';

import utils from './utils';

const log = logger.getLogger();

async function saveDeposit(
  source: string,
  depositAddress: string,
  depositAmount: BigNumber,
  block: string,
): Promise<void> {
  const pool = utils.getPool();
  const client = await pool.connect();

  const values = [
    source,
    depositAmount.toFixed(),
    depositAddress,
    block,
    new Date().toISOString(),
  ];

  log.debug(values);

  try {
    const res = await client.query(
      'INSERT INTO deposits (source, amount, deposit_address, block, created_at) VALUES ($1, $2, $3, $4, $5)',
      values,
    );

    log.debug(res);
    client.release();
  } catch (e) {
    client.release();
    throw e;
  }
}

export default {
  saveDeposit,
};
