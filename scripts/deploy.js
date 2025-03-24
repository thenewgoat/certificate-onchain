// scripts/deploy.js

const fs = require("fs");
const hre = require("hardhat");



// To integrate this script --> things that need to be passed to this function from outside via API calls
// 1. issuerAddress
// 2. baseURI
// 3. orgDescription

// To customize the script for other use cases, ctrl+F "CUSTOMISE" to find the relevant sections to modify

async function main() {
  console.log("Starting deployment script...");

  // 1. Read environment variables
  const issuerAddress = process.env.ISSUER_ADDRESS;
  const baseURI = process.env.BASE_URI;

  if (!issuerAddress) {
    throw new Error("Missing environment variable ISSUER_ADDRESS");
  }
  if (!baseURI) {
    throw new Error("Missing environment variable BASE_URI");
  }

  console.log("Issuer address:", issuerAddress);
  console.log("Base URI:", baseURI);

  // 2. Optionally read an organization-level description from a file
  // const filePath = "./stores/sample_org_description.txt"; 
  let orgDescription = "This smart contract securely stores and manages course certificates issued to students by Google."; //CUSTOMISE
  try {
    orgDescription = fs.readFileSync(filePath, "utf8");
    console.log("Organization description read from file.");
  } catch (err) {
    console.log("No org description file found, using default.");
  }

  // 3. Get the contract factory
  const SoulboundCert = await hre.ethers.getContractFactory("SoulboundCert");
  console.log("Got the SoulboundCert contract factory. Deploying now...");

  // 4. Use the first signer (deployer) as the designated minter
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer (minter) address:", deployer.address);

  // 5. Deploy the contract
  // constructor(
  //   string memory name_,
  //   string memory symbol_,
  //   string memory contractDescription_,
  //   address issuer_,
  //   address minter_,
  //   string memory baseURI_
  // )
  const name = "Google-Cert-2025"; //CUSTOMISE
  const symbol = "CERT"; //CUSTOMISE
  const nftContract = await SoulboundCert.deploy(
    name,                // name 
    symbol,              // symbol
    orgDescription,      // contractDescription_ 
    issuerAddress,       // issuer_
    deployer.address,    // minter_
    baseURI              // e.g. "ipfs://QmXYZ123/"
  );
  await nftContract.waitForDeployment();
  console.log("Contract deployed!");

  const contractAddress = await nftContract.getAddress();
  console.log("SoulboundCert deployed to:", contractAddress);

  // 6.Mint first token (tokenid = 0) to deployer/minter

  //CUSTOMIzE -- Can choose to not mint first NFT
  /*
  console.log("Minting a sample certificate to the receiver with BurnAuth = IssuerOnly (0)...");
  const tx = await nftContract.issueCertificate(
    deployer.address, // to
    2                // BurnAuth (0=IssuerOnly, 1=OwnerOnly, 2=Both, 3=Neither)
  );

  await tx.wait();
  console.log("Sample certificate minted (tokenId=0).");

  // 7. Confirm ownerOf(0)
  const ownerOfZero = await nftContract.ownerOf(0);
  console.log("Owner of token #0 is:", ownerOfZero);
  */

  // replace CONTRACT_ADDRESS in .env file
  const envFilePath = "./.env";
  const envFile = fs.readFileSync(envFilePath, "utf8");
  const updatedEnvFile = envFile.replace(
    /CONTRACT_ADDRESS=.*/,
    `CONTRACT_ADDRESS=${contractAddress}`
  );
  fs.writeFileSync(envFilePath, updatedEnvFile);

  // 8. Log the verification command (for Windows CMD)
  // We'll sanitize orgDescription for quotes/newlines
  const sanitizedOrgDesc = orgDescription
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, "\\n");
  console.log("\n--- COPY & PASTE THIS TO VERIFY VIA WINDOWS CMD ---\n");
  console.log(
    `npx hardhat verify --network polygonAmoy ${contractAddress} "${name}" "${symbol}" "${sanitizedOrgDesc}" "${issuerAddress}" "${deployer.address}" "${baseURI}"`
  );
  console.log("\n---------------------------------------------\n");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
