// scripts/mint.js

const hre = require("hardhat");
const minimist = require("minimist");

// To integrate this script --> things that need to be passed to this function from outside via API calls
// 1. contractAddress
// 2. receiverAddress
// 3. burnAuth


async function main() {

    const argv = minimist(process.argv.slice(2));

    // 1. Read environment variables or fallback
    const contractAddress = process.env.CONTRACT_ADDRESS;

    const receiverArg = argv.receiver;
    const receiverEnv = process.env.RECEIVER_ADDRESS;
    const receiverAddress = receiverArg || receiverEnv;

    const burnAuth = process.env.BURN_AUTH || "0"; // default: IssuerOnly (0)
  
    if (!contractAddress) {
      throw new Error("Missing environment variable CONTRACT_ADDRESS");
    }
    if (!receiverAddress) {
      throw new Error("Missing environment variable RECEIVER_ADDRESS");
    }
  
    console.log("Contract address:", contractAddress);
    console.log("Receiver address:", receiverAddress);
    console.log("Burn authorization:", burnAuth);
  
    // 2. Get a signer to call the mint function
    // Must have MINTER_ROLE in the deployed contract
    const [deployer] = await hre.ethers.getSigners();
    console.log("Using minter account:", deployer.address);
  
    // 3. Attach to the deployed contract
    const nftContract = await hre.ethers.getContractAt(
      "SoulboundCert",
      contractAddress,
      deployer
    );
  
    // 4. Call the contract’s mint function
    // function issueCertificate(address to, BurnAuth burnAuthType)
    const tx = await nftContract.issueCertificate(receiverAddress, burnAuth);
    await tx.wait();
  
    console.log("Certificate minted successfully!");
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });