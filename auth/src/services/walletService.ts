import request from 'got';

import { logger } from 'bsh-shared-module';

const log = logger.getLogger();

const { WALLET_MANAGER_URL } = process.env;

async function getNewAccount(): Promise<string> {
  const response: any = await request.post(`${WALLET_MANAGER_URL}/accounts`, {
    json: {},
    responseType: 'json',
  });

  log.debug('getNewAccount response body:', response.body);
  return response?.body?.data;
}

export default {
  getNewAccount,
};
