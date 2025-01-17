import { IN_DEVELOPMENT, IN_PREVIEW } from '../config/env';

export enum ENTRANCE {
  ADMIN = 'circle-create-initial-admin',
  LINK = 'invite-link',
  MANUAL = 'manual-address-entry',
  CSV = 'CSV',
  NOMINATION = 'vouched-in',
  DISCORD_BOT = 'discord-bot',
  GUILD = 'guild',
}

export const loginSupportedChainIds: Record<string, string> = {
  1: 'Ethereum Mainnet',
  10: 'Optimism',
  137: 'Polygon',
  8453: 'Base Mainnet',
  42161: 'Arbitrum One',
  250: 'Fantom Opera',
  1313161554: 'Near Aurora',
  1997: 'Reef Chain',
  ...(IN_PREVIEW && { 11155420: 'Optimism Sepolia' }),
  ...(IN_DEVELOPMENT && {
    11155420: 'Optimism Sepolia',
    1338: 'Localhost Ganache',
    1337: 'Locahost Hardhat',
    11155111: 'Eth Sepolia',
  }),
};
