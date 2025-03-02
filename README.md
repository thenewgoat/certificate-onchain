# How to use

1. Navigate to your directory.
2. Make necessary changes to the deployment script.\
&emsp;&emsp;2a. Define these environment variables:\
&emsp;&emsp;&emsp;&emsp;METAMASK_PRIVATE_KEY,\
&emsp;&emsp;&emsp;&emsp;RECEIVER_ADDRESS,\
&emsp;&emsp;&emsp;&emsp;ISSUER_ADDRESS,\
&emsp;&emsp;&emsp;&emsp;BASE_URI,\
&emsp;&emsp;&emsp;&emsp;CONTRACT_ADDRESS (after successfuly deployment)\
4. Compile the contract.
```shell
npx hardhat clean
npx hardhat compile
```
4. Deploy the contract.
```shell
npx hardhat run scripts/deploy.js --network polygonAmoy
```
Follow the instructions in the console to verify the contract.\
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
