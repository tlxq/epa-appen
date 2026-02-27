import crypto from 'crypto';

export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}
