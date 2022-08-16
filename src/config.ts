import dotenv from 'dotenv';
import { ethers } from 'ethers';
dotenv.config();

export const checkEnvVariables = (vars: string[]): void =>
  vars.forEach((variable) => {
    if (!process.env[variable] || process.env[variable] === '') {
      throw new Error(`${variable} must be provided in the ENV`);
    }
  });

checkEnvVariables([
  'PORT',
  'APP_ACCESS_TOKEN_KEY',
  'APP_REFRESH_TOKEN_KEY',
  'APP_PROMETHEUS_PORT',
  'APP_VERSION',
  'MONGODB_URL',
  'DB_NAME',
  'DERBYSOFT_PROXY_URL',
  'CLIENT_JWT',
  'SIMARD_JWT',
  'SIMARD_ORG_ID',
  'SIMARD_URL',
  'SENDGRID_API_KEY',
  'SENDGRID_EMAIL_FROM',
  'SENDGRID_EMAIL_TEMPLATE_ID'
]);

export const port = Number(process.env.PORT);
export const accessTokenKey = String(process.env.APP_ACCESS_TOKEN_KEY);
export const refreshTokenKey = String(process.env.APP_REFRESH_TOKEN_KEY);
export const debugEnabled = Boolean(process.env.DEBUG_LPMS_SERVER === 'true');
export const prometheusEnabled = Boolean(
  process.env.PROMETHEUS_ENABLED === 'true'
);
export const prometheusPort = Number(process.env.APP_PROMETHEUS_PORT);
export const refreshTokenMaxAge = 30 * 24 * 60 * 60 * 1000; //30d
export const accessTokenMaxAge = 30 * 60 * 1000; //30m
export const secretTokenMaxAge = 5 * 60 * 1000; //5m
export const mongoDBUrl = String(process.env.MONGODB_URL);
export const DBName = String(process.env.DB_NAME);
export const derbySoftProxyUrl = String(process.env.DERBYSOFT_PROXY_URL);
export const clientJwt = String(process.env.CLIENT_JWT);
export const clientUrl = String(process.env.CLIENT_URL);
export const simardJwt = String(process.env.SIMARD_JWT);
export const simardOrgId = String(process.env.SIMARD_ORG_ID);
export const simardUrl = String(process.env.SIMARD_URL);
export const sendgridApiKey = String(process.env.SENDGRID_API_KEY);
export const sendgridEmailFrom = String(process.env.SENDGRID_EMAIL_FROM);
export const sendgridEmailTo = String(process.env.SENDGRID_EMAIL_TO || '');
export const sendgridEmailTemplateId = String(
  process.env.SENDGRID_EMAIL_TEMPLATE_ID
);
export const defaultRadius = 2000; //in meters
export const allowLocalhostUI = Boolean(
  process.env.ALLOW_LOCALHOST_UI === 'true'
);
export const allowHardhatNetwork = Boolean(
  process.env.ALLOW_HARDHAT_NETWORK === 'true'
);

export const assetsCurrencies = ['EUR', 'USD', 'JPY', 'CNY']; // currency the asset is pegged to
export type AssetCurrency = typeof assetsCurrencies[number];

export interface CryptoAsset {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  image: string;
  native: boolean;
  permit: boolean;
  currency: AssetCurrency;
}

export interface Network {
  name: string;
  chainId: number;
}

export interface NetworkInfo extends Network {
  currency: string;
  decimals: number;
  rpc: string;
  contracts: {
    ledger: string;
    winPay: string;
    assets: CryptoAsset[];
  };
  blockExplorer: string;
}

const networks: NetworkInfo[] = [
  {
    name: 'Sokol Testnet',
    chainId: 77,
    rpc: 'https://sokol.poa.network',
    blockExplorer: 'https://blockscout.com/poa/sokol',
    currency: 'xDAI',
    decimals: 18,
    contracts: {
      ledger: '0x3196f354b7a95413E30889D1C6cE5074b10c43f5',
      winPay: '0x6f2fBD652A99Db4b8143c8383Ae39b5459268685',
      assets: [
        {
          name: 'Native xDAI',
          symbol: 'xDAI',
          address: '0x25149dE5afe2043C61687AD136527d2167EFC241',
          decimals: 18,
          image:
            'https://bafybeiesj7lzhl7gb3xnnazkozdh6cdsby2nmgphqc6ts6rnlf4mnczzbm.ipfs.dweb.link/8635.png',
          native: true,
          permit: false,
          currency: 'USD'
        },
        {
          name: 'Wrapped xDAI',
          symbol: 'wxDAI',
          address: '0x25149dE5afe2043C61687AD136527d2167EFC241',
          decimals: 18,
          image:
            'https://bafybeicj27bao6jkip26yhvc32tcyror5asop6dfxk3db67yfkxc6me6ym.ipfs.dweb.link/9021.png',
          native: false,
          permit: true,
          currency: 'USD'
        },
        {
          name: 'USDC',
          symbol: 'USDC',
          address: '0x1C375919362730AC69c5ACffeC775F11c9b75cF2',
          decimals: 18,
          image:
            'https://bafybeif5mtgb4mtvvqbhw2kdr4uruu5xm742vtwa3cwndpnsqdb2t4676m.ipfs.dweb.link/3408.png',
          native: false,
          permit: true,
          currency: 'USD'
        }
      ]
    }
  }
];
if (allowHardhatNetwork) {
  const localNetwork = {
    name: 'Localhost',
    chainId: 31337,
    rpc: 'http://127.0.0.1:8545',
    blockExplorer: '',
    currency: 'xDAI',
    decimals: 18,
    contracts: {
      ledger: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
      winPay: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
      assets: [
        {
          name: 'Native xDAI',
          symbol: 'xDAI',
          address: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
          decimals: 18,
          image:
            'https://bafybeiesj7lzhl7gb3xnnazkozdh6cdsby2nmgphqc6ts6rnlf4mnczzbm.ipfs.dweb.link/8635.png',
          native: true,
          permit: false,
          currency: 'USD'
        },
        {
          name: 'Wrapped xDAI',
          symbol: 'wxDAI',
          address: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
          decimals: 18,
          image:
            'https://bafybeicj27bao6jkip26yhvc32tcyror5asop6dfxk3db67yfkxc6me6ym.ipfs.dweb.link/9021.png',
          native: false,
          permit: true,
          currency: 'USD'
        },
        {
          name: 'USDC',
          symbol: 'USDC',
          address: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
          decimals: 18,
          image:
            'https://bafybeif5mtgb4mtvvqbhw2kdr4uruu5xm742vtwa3cwndpnsqdb2t4676m.ipfs.dweb.link/3408.png',
          native: false,
          permit: true,
          currency: 'USD'
        }
      ]
    }
  } as NetworkInfo;

  networks.push(localNetwork);
}

export const allowedNetworks: readonly NetworkInfo[] = Object.freeze(networks);

const encodedWallet =
  '{"address":"b7f3f36d83924aecbb50c180ad33a3642166936e","id":"bb16c9df-b5bf-453c-ae6d-a02fc548d9c3","version":3,"Crypto":{"cipher":"aes-128-ctr","cipherparams":{"iv":"5c6f6830e15bfb3d414df302568f7708"},"ciphertext":"3c8b3d26e385ef98f89d03f9ba2339a7322cf88c5e9a2978a1954a82cae709ef","kdf":"scrypt","kdfparams":{"salt":"4149546ebebcaf13f6c9402372148cc63aef2716196ea4d144a417a526df7204","n":131072,"dklen":32,"p":1,"r":8},"mac":"5f769679ceae95c75a86d4fbd1823889d060c2d00c3cf317a7acb8351052abe2"},"x-ethers":{"client":"ethers.js","gethFilename":"UTC--2022-08-15T10-31-14.0Z--b7f3f36d83924aecbb50c180ad33a3642166936e","mnemonicCounter":"72aa34f8659338b7fd558ee61ba09507","mnemonicCiphertext":"5d9650d0b1ebe68da003e591107417fe","path":"m/44\'/60\'/0\'/0/0","locale":"en","version":"0.1"}}';
const encodeWalletSalt = 'salt';
export const testWallet = ethers.Wallet.fromEncryptedJson(
  encodedWallet,
  encodeWalletSalt
);
