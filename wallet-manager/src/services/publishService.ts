import amqp from 'amqplib';

import { logger } from 'bsh-shared-module';

import { DepositMessage, ErrorMessage } from '../messages';

const log = logger.getLogger();

const { AMQP_URL, AMQP_EXCHANGE } = process.env;

let connection: amqp.Connection;
let channel: amqp.Channel;

async function publishDepositMessage(address: string, amount: string): Promise<void> {
  const data: DepositMessage = {
    type: 'DEPOSIT',
    data: {
      address,
      amount,
    },
  };

  try {
    const ch = await getChannel();
    log.debug('got channel, publishing to channel');
    await ch.publish(AMQP_EXCHANGE, 'DEPOSIT', Buffer.from(JSON.stringify(data)), {});
    log.debug('published to channel');
  } catch (e) {
    log.error('error publishing message:', e);
    throw new Error('error publishing message');
  }
}

async function publishErrorMessage(code: string, message: string): Promise<void> {
  const data: ErrorMessage = {
    type: 'ERROR',
    data: {
      code,
      message,
    },
  };

  try {
    const ch = await getChannel();
    log.debug('got channel, publishing to channel');
    await ch.publish(AMQP_EXCHANGE, 'ERROR', Buffer.from(JSON.stringify(data)), {});
    log.debug('published to channel');
  } catch (e) {
    log.error('error publishing message:', e);
    throw new Error('error publishing message');
  }
}

async function getChannel(): Promise<amqp.Channel> {
  if (!channel) {
    log.debug('no channel, getting channel');
    const conn = await getConnection();
    channel = await conn.createConfirmChannel();
    log.debug('created confirm channel');
  }

  return channel;
}

async function getConnection(): Promise<amqp.Connection> {
  if (connection) {
    log.debug('returning existing connection');
    return connection;
  }

  return amqp.connect(AMQP_URL, (err: Error, conn: amqp.Connection) => {
    if (err) {
      throw err;
    }

    conn.on('error', (err: Error) => {
      if (err.message !== "Connection closing") {
        log.error("[AMQP] conn error", err.message);
      }
    });

    conn.on("close", () => {
      log.error("[AMQP] reconnecting");
      connection = null;
    });

    log.debug("[AMQP] connected");
    connection = conn;

    return conn;
  });
}

export default {
  publishDepositMessage,
  publishErrorMessage,
};
