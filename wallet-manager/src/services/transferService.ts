import { logger } from 'bsh-shared-module';
import utils from './utils';

import { SendRequest } from './walletService';

const log = logger.getLogger();

async function saveTransfer(req: SendRequest, block: string): Promise<void> {
  const pool = utils.getPool();
  const client = await pool.connect();

  const values = [
    req.id,
    req.rawAmount.toFixed(),
    req.source,
    req.destination,
    block,
    new Date().toISOString(),
  ];

  log.debug(values);

  try {
    const res = await client.query(
      'INSERT INTO account_transfers (transferId, amount, source, destination, block, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
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
  saveTransfer,
};
