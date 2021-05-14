import { User } from '../interfaces';

import userService from '../services/userService';

async function getUser(name: string): Promise<User | null> {
  const user = await userService.getUser(name);

  if (!user) {
    return null;
  }

  const userCopy = { ...user };
  delete userCopy.password;

  return userCopy;
}

export default {
  getUser,
};
