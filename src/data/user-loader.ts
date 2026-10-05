import * as fs from 'node:fs';
import * as path from 'node:path';
import type { TestUser, UsersFile } from './types';

const usersFilePath = path.join(__dirname, 'users.json');

function readUsersFile(): UsersFile {
  const raw = fs.readFileSync(usersFilePath, 'utf-8');
  return JSON.parse(raw) as UsersFile;
}

/**
 * Loads a user from `users.json` by its stable data key (e.g. `"TC01 Register User"`).
 */
export function getUserByTestName(testName: string): TestUser | undefined {
  const data = readUsersFile();
  return data.users[testName];
}

/**
 * Returns a copy of the user with a unique email (for registration flows that require a fresh address).
 */
export function withUniqueEmail(user: TestUser): TestUser {
  const unique = user.email.replace('@', `+${Date.now()}@`);
  return { ...user, email: unique };
}
