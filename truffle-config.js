const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');

const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545, // `truffle develop` port
      network_id: "*"
    },
    fuji: {
      provider: () => {
        return new HDWalletProvider({
          mnemonic,
          providerOrUrl: "https://api.avax-test.network/ext/bc/C/rpc",
          derivationPath: `m/44'/60'/0'/0/`,
          confirmations: 0,
          timeoutBlocks: 200,
        });
      },
      network_id: 43113,
      gasPrice: 30 * 1e9,
    },
  },

  compilers: {
    solc: {
      version: "=0.8.13",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },
};
