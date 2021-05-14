import BigNumber from 'bignumber.js';

import { logger } from 'bsh-shared-module';

import { Message } from '../messages';

import consumeService from '../services/consumeService';
import publishService from '../services/publishService';
import userService from '../services/userService';

const log = logger.getLogger();

async function pollAndHandleMessages() {
  log.debug('polling messages');
  await consumeService.receiveMessages(handleMessage);
}

async function handleMessage(msg: Message) {
  switch (msg.type) {
    case 'DEPOSIT': {
      const amount = new BigNumber(msg.data.amount);
      const { address } = msg.data;

      try {
        await userService.incrementBalance(address, amount);
      } catch (e) {
        await publishService.publishErrorMessage('DB_ERROR', e.message);
        throw e;
      }

      return;
    }

    default: {
      return;
    }
  }
}

export default {
  pollAndHandleMessages,
};
