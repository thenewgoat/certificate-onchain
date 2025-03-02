require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { METAMASK_PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.28",
  paths: {
    sources: "./contracts/active"
  },
  networks: {
    // Polygon Amoy Testnet
    polygonAmoy: {
      url: "https://rpc-amoy.polygon.technology/",  // the RPC endpoint from your testnet docs
      chainId: 80002,                       // placeholder chain ID
      accounts: [METAMASK_PRIVATE_KEY],              // use the private key from .env
    },
    // Polygon Mainnet
    polygonMainnet: {
      url: "https://polygon-rpc.com",
      chainId: 137,
      accounts: [METAMASK_PRIVATE_KEY],              // use the private key from .env
    },
  },
};