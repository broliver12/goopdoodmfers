require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
const secret = require("./env/secrets.json");

// Formatted private key
const acc = [`0x${secret.METAMASK_WALLET_PRIVATE_KEY}`];

// Available Solidity compiler versions
const pragmas = [
  {
    version : "0.8.4"
  },
];

const currencies = {
  ether: "ETH",
}

// Available Networks
const nw = {
  hardhat: {},
  homestead: {
    url: secret.HOMESTEAD_NODE_URL,
    chainId: 1,
    accounts: acc,
    currency: currencies.ether,
    mainnet: true
  },
  rinkeby: {
    url: secret.RINKEBY_NODE_URL,
    chainId: 4,
    accounts: acc,
    currency: currencies.ether,
    mainnet: false
  },
};

// Use this to keep track of which networks use which scan key
const scanKeys = {
  homestead: secret.ETHERSCAN_API_KEY,
  rinkeby: secret.ETHERSCAN_API_KEY,
};

// Hardhat config exports
module.exports = {
  solidity: {
    compilers : pragmas,
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./solidity",
    tests: "./test",
    cache: "./build/cache",
    artifacts: "./build/artifacts"
  },
  defaultNetwork: "hardhat",
  networks: nw,
  networkInfo: JSON.stringify(nw),
  etherscan: {
    // This NEEDS to be a single string for now.
    // Change this to the correct network's scanKey
    // before running verify or other hardhat scan operations
    apiKey: scanKeys.homestead
  },
  mocha: {
    timeout: 300000
  }
};
