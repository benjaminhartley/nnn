import { logger, uuid as uuidUtils } from 'bsh-shared-module';

import depositService from '../services/depositService';
import publishService from '../services/publishService';
import transferService from '../services/transferService';
import walletService from '../services/walletService';

const log = logger.getLogger();
const uuid = uuidUtils.createUuid;

interface ReceivedResponse {
  [key: string]: string[];
}

async function receivePending(): Promise<ReceivedResponse> {
  const res = await walletService.pending();
  log.debug('res.blocks:', res.blocks);

  const { firstAccount } = await walletService.getWalletBalances();

  const response: ReceivedResponse = {};

  for (const account of Object.keys(res.blocks)) {
    const blocks = res.blocks[account];

    for (const block of blocks) {
      log.debug('block:', block);
      if (block !== '') {
        const receipt = await walletService.receive({
          account,
          block,
        });

        // verify receipt
        const blockInfo = await walletService.getBlockInfo(block);
        log.debug('blockInfo:', blockInfo);

        if (blockInfo.confirmed.toLowerCase() !== 'true') {
          // todo: pause and retry or queue to retry
          continue;
        }

        const source = blockInfo.block_account;
        const depositAddress = blockInfo.contents.link_as_account;
        const depositAmount = blockInfo.amount;

        if (depositAddress === firstAccount) {
          log.info('deposit is consolidation transfer');
        } else {
          try {
            log.debug('saving deposit');
            await depositService.saveDeposit(source, depositAddress, depositAmount, block);
            log.debug('deposit saved');
          } catch (e) {
            log.error('error saving deposit:', e);
            // todo: emit error event or retry?
          }

          try {
            log.debug('calling to publish message');
            await publishService.publishDepositMessage(depositAddress, depositAmount.toFixed());
            log.info('DEPOSIT message published');
          } catch (e) {
            log.error('error emitting DEPOSIT event');
          }
        }

        if (!response[account]) {
          response[account] = [];
        }

        response[account].push(receipt.block);
      }
    }
  }

  return response;
}

async function consolidateToStorage(): Promise<void> {
  const { balances, firstAccount } = await walletService.getWalletBalances();
  log.debug(`first account: ${firstAccount}`);
  log.debug(balances);

  for (const account of Object.keys(balances)) {
    if (account === firstAccount) {
      continue;
    }

    const sendReq = {
      id: uuid(),
      source: account,
      destination: firstAccount,
      rawAmount: balances[account],
    };

    log.info('consolidation send:', sendReq);

    const block = await walletService.sendRaw(sendReq);
    log.info(`block: ${block}`);

    await transferService.saveTransfer(sendReq, block);
  }
}

export default {
  consolidateToStorage,
  receivePending,
};
