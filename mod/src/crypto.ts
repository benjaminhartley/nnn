import bcrypt from 'bcrypt';

const saltRounds = 10;

function hashPassword(pwd: string): string {
  return bcrypt.hashSync(pwd, saltRounds);
}

function comparePassword(pwd: string, hashedPwd: string): boolean {
  return bcrypt.compareSync(pwd, hashedPwd);
}

export default {
  comparePassword,
  hashPassword,
};
