const hre = require("hardhat");
const minimist = require("minimist");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
    const argv = minimist(process.argv.slice(2));

    // 1. Read environment variables
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const certificatePath = "./ipfs_metadata/certificates/google/"; // CUSTOMISE: Path to the folder containing the JSON certificate files
    const burnAuth = "0"; // Default: IssuerOnly (0)
    
    if (!contractAddress) {
        throw new Error("Missing environment variable CONTRACT_ADDRESS");
    }

    const addresses = JSON.parse(process.env.ADDRESSES.replace(/'/g, '"'));

    
    // Get a signer to call the mint function
    const [deployer] = await hre.ethers.getSigners();
    console.log("Using minter account:", deployer.address);

    // Attach to the deployed contract
    const nftContract = await hre.ethers.getContractAt(
        "SoulboundCert",
        contractAddress,
        deployer
    );

    // Read all JSON certificate files and process them iteratively
    const certificateFiles = fs.readdirSync(certificatePath).filter(file => file.endsWith(".json"));

    for (const file of certificateFiles) {
        const filePath = path.join(certificatePath, file);
        const certData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        
        const studentName = certData.attributes.find(attr => attr.trait_type === "Student Name").value;
        const receiverAddress = addresses[studentName];

        if (!receiverAddress) {
            console.error(`No address found for ${studentName}. Skipping...`);
            continue;
        }

        console.log(`Minting certificate for ${studentName} to address ${receiverAddress}`);

        // Call the contract’s mint function
        const tx = await nftContract.issueCertificate(receiverAddress, burnAuth);
        await tx.wait();

        console.log(`Certificate minted successfully for ${studentName}!`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
