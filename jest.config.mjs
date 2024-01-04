import defaults from '@cloud-cli/jest-config';

const config = {
  ...defaults,
  testMatch: ['**/test/*.spec.[tj]s'],
};

export default config;
