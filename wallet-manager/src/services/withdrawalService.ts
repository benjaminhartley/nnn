import BigNumber from 'bignumber.js';

import { logger } from 'bsh-shared-module';
import utils from './utils';

const log = logger.getLogger();

async function saveWithdrawal(
  name: string,
  source: string,
  withdrawalAddress: string,
  withdrawalAmount: BigNumber,
  block: string
): Promise<void> {
  const pool = utils.getPool();
  const client = await pool.connect();

  const values = [
    name,
    source,
    withdrawalAmount.toFixed(),
    withdrawalAddress,
    block,
    new Date().toISOString(),
  ];

  log.debug(values);

  try {
    const res = await client.query(
      'INSERT INTO withdrawals (name, source, amount, withdrawal_address, block, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
      values,
    );

    log.debug(res);
    client.release();
  } catch (e) {
    client.release();
    log.error(e);
    throw new Error('error saving deposit');
  }
}

export default {
  saveWithdrawal,
};
