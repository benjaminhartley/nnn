import { v4 } from 'uuid';

function createUuid(): string {
  return v4();
}

export default {
  createUuid,
};
