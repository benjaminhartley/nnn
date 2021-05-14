import BigNumber from 'bignumber.js';

import { logger, nano, uuid as uuidUtils } from 'bsh-shared-module';

import { Message } from '../messages';

import consumeService from '../services/consumeService';
import walletService from '../services/walletService';
import withdrawalService from '../services/withdrawalService';

const log = logger.getLogger();
const uuid = uuidUtils.createUuid;

async function pollAndHandleMessages() {
  log.debug('polling messages');
  await consumeService.receiveMessages(handleMessage);
}

async function handleMessage(msg: Message) {
  switch (msg.type) {
    case 'WITHDRAWAL': {
      const amount = new BigNumber(msg.data.amount);
      const { name } = msg.data;
      log.info('WITHDRAWAL request:', name, amount);

      if (amount.isLessThanOrEqualTo(0)) {
        throw new Error('withdrawal amount must be greater than zero');
      }

      if (!nano.isValidNanoAddress(msg.data.address)) {
        throw new Error(`invalid address: ${msg.data.address}`);
      }

      const { firstAccount, balances } = await walletService.getWalletBalances();
      log.info('firstAccount:', firstAccount);
      log.info('balances:', balances);

      const firstAccountBalance = balances[firstAccount];
      log.info('firstAccountBalance:', firstAccountBalance.toFixed());
      log.info('withdrawal request amount:', amount.toFixed());

      if (amount.isGreaterThan(firstAccountBalance)) {
        // todo: verify that this will retry the message
        throw new Error('first account has low balance');
      }

      const sendReq = {
        id: uuid(),
        source: firstAccount,
        destination: msg.data.address,
        rawAmount: amount,
      };

      log.info(
        `sending ${sendReq.rawAmount} from ${sendReq.source} to ${sendReq.destination} (${sendReq.id})`,
      );

      const block = await walletService.sendRaw(sendReq);
      log.info('transaction block:', block);

      // todo: save block data from send
      await withdrawalService.saveWithdrawal(
        name,
        firstAccount,
        msg.data.address,
        amount,
        block
      );

      log.debug('withdrawal saved in db');
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
