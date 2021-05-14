import BigNumber from 'bignumber.js';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const validator = require('multicoin-address-validator');

const NANO_CONSTANT = new BigNumber('10e29');

function convertRawToNano(raw: BigNumber): BigNumber {
  return raw.dividedBy(NANO_CONSTANT);
}

function convertNanoToRaw(nano: BigNumber): BigNumber {
  return nano.times(NANO_CONSTANT);
}

function isValidNanoAddress(address: string): boolean {
  return validator.validate(address, 'nano');
}

export default {
  convertNanoToRaw,
  convertRawToNano,
  isValidNanoAddress,
};
