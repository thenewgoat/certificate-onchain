# How to use

This repository deploys the certificate tokens on PolygonAmoy.

1. Navigate to your directory.
2. Make necessary changes to the deployment script.
&emsp;&emsp;2a. Define these environment variables: METAMASK_PRIVATE_KEY, RECEIVER_ADDRESS, ISSUER_ADDRESS, BASE_URI, CONTRACT_ADDRESS (after successfuly deployment)
3. Compile the contract.
```shell
npx hardhat clean
npx hardhat compile
```
4. Deploy the contract.
```shell
npx hardhat run scripts/deploy.js --network polygonAmoy
```
Follow the instructions in the console to verify the contract.
5. Mint your new certificate!
```shell
npx hardhat run scripts/mint.js --network polygonAmoy
```
Make sure to update IPFS with the relevant metadata.json files. Formatting for tokenURI is ${baseURI}/${tokenID}.json


#### Testing
To test your contract, run the following:
```shell
npx hardhat test
```
These are the current tests:\
&emsp;Non-transferability\
&emsp;&emsp;√ should be soulbound (non-transferable)\
&emsp;Issuer-Minter Interactions\
&emsp;&emsp;√ should allow designated minter to mint tokens\
&emsp;&emsp;√ should not allow issuer to mint tokens if they are not the designated minter\
&emsp;&emsp;√ should verify that issuer and minter are distinct accounts\
&emsp;Burn Authorization Tests\
&emsp;&emsp;√ should allow burning only by the authorized party (IssuerOnly)\
&emsp;&emsp;√ should allow burning only by the token owner (OwnerOnly)\
&emsp;&emsp;√ should allow burning by either issuer or token owner (Both)\
&emsp;&emsp;√ should not allow burning for tokens with Neither authorization\
