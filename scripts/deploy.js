const fs = require("fs");
const hre = require("hardhat");

async function main() {
  console.log("Starting deployment script...");

  // Read environment variables for receiver and issuer addresses.
  const receiverAddress = process.env.RECEIVER_ADDRESS;
  const issuerAddress = process.env.ISSUER_ADDRESS;
  if (!receiverAddress) {
    throw new Error("Missing environment variable RECEIVER_ADDRESS");
  }
  if (!issuerAddress) {
    throw new Error("Missing environment variable ISSUER_ADDRESS");
  }
  console.log("Receiver address:", receiverAddress);
  console.log("Issuer address:", issuerAddress);

  // 1. Read the certificate from your file
  const filePath = "./stores/sample_cert.txt"; // adjust this path as needed
  const transcriptData = fs.readFileSync(filePath, { encoding: "utf8" });
  console.log("Certificate file read successfully.");

  const sanitizedTranscript = transcriptData
  .replace(/"/g, '\\"')        // Escape double quotes
  .replace(/\r?\n/g, "\\n");   // Replace newlines with \n

  // 2. Get the contract factory for SoulboundCert
  const CertificateNFT = await hre.ethers.getContractFactory("SoulboundCert");
  console.log("Got the SoulboundCert contract factory. Deploying now...");

  // 3. Get the deployer (which will serve as the minter)
  const [deployer] = await ethers.getSigners();
  console.log("Deployer (minter) address:", deployer.address);

  // 4. Deploy the contract.
  // Note: The contract constructor now accepts: name, symbol, transcript, issuer, and minter.
  // Here we pass the ISSUER_ADDRESS from env, and use deployer.address as the minter.
  const nftContract = await CertificateNFT.deploy(
    "CertificateNFT",
    "TNFT",
    transcriptData,
    issuerAddress,
    deployer.address
  );

  // 5. Wait for the contract deployment to be confirmed
  await nftContract.waitForDeployment();
  console.log("Contract deployed!");

  // Retrieve the contract address (Ethers v6)
  const contractAddress = await nftContract.getAddress();
  console.log("CertificateNFT deployed to:", contractAddress);

  // Log the certificate stored on-chain
  const transcript = await nftContract.transcript();
  console.log("Certificate:", transcript);

  // 6. Issue the token to the receiver address defined in the environment.
  console.log("Issuing token to receiver address:", receiverAddress);
  // For the burn authorization, we pass 0 (e.g., IssuerOnly).
  const issueTx = await nftContract.issueToken(receiverAddress, 0);
  await issueTx.wait();
  console.log("Token issued to", receiverAddress);

  // 7. Retrieve the owner of the minted token (tokenId 0)
  const ownerOfTokenZero = await nftContract.ownerOf(0);
  console.log("Owner of token #0 is:", ownerOfTokenZero);

  console.log("\n--- COPY & PASTE THIS TO VERIFY ON WINDOWS CMD ---\n");
  console.log(
    `npx hardhat verify --network polygonAmoy ${contractAddress} "CertificateNFT" "TNFT" "${sanitizedTranscript}" "${issuerAddress}" "${deployer.address}"`
  );
  console.log("\n---------------------------------------------\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
