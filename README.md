# How to use

1. Navigate to your directory.
2. Compile the contract.
```shell
npx hardhat clean
npx hardhat compile
```
3. Deploy the contracts.
```shell
npx hardhat run scripts/deploy.js --network polygonAmoy
```

#### Testing
To test your contract, run the following:
```shell
npx hardhat test
```
These are the current tests:
    Non-transferability
      √ should be soulbound (non-transferable)
    Issuer-Minter Interactions
      √ should allow designated minter to mint tokens
      √ should not allow issuer to mint tokens if they are not the designated minter
      √ should verify that issuer and minter are distinct accounts
    Burn Authorization Tests
      √ should allow burning only by the authorized party (IssuerOnly)
      √ should allow burning only by the token owner (OwnerOnly)
      √ should allow burning by either issuer or token owner (Both)
      √ should not allow burning for tokens with Neither authorization
