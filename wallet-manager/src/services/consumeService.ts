import amqp from 'amqplib';

import publishService from './publishService';

import { logger } from 'bsh-shared-module';

import { Message } from '../messages';

const log = logger.getLogger();

const { AMQP_URL, AMQP_WITHDRAWALS_QUEUE } = process.env;

let connection: amqp.Connection;
let channel: amqp.Channel;

type MessageHandler = (msg: Message) => Promise<void>;

async function receiveMessages(handler: MessageHandler): Promise<amqp.Replies.Consume> {
  try {
    const ch = await getChannel();

    return ch.consume(AMQP_WITHDRAWALS_QUEUE, async (msg) => {
      if (msg !== null) {
        log.debug('msg:', msg);
        const message: Message = JSON.parse(msg.content.toString());

        try {
          await handler(message);
          ch.ack(msg);
        } catch (e) {
          log.error('message handling error:', e);

          if (e.message.startsWith('invalid address')) {
            await publishService.publishErrorMessage('INVALID_WITHDRAWAL_ADDRESS', e.message);
            ch.ack(msg);
          } else {
            setTimeout(() => {
              ch.nack(msg, false, true);
            }, 40 * 1000);
          }
        }
      }
    });
  } catch (e) {
    log.error('error receiving messages:', e);
    throw new Error('error receiving messages');
  }
}

async function getChannel(): Promise<amqp.Channel> {
  if (!channel) {
    log.debug('no channel, getting channel');
    const conn = await getConnection();
    channel = await conn.createChannel();
    log.debug('created channel');
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
  receiveMessages,
};
