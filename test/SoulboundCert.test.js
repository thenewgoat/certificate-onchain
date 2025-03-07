const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SoulboundCert (Soulbound Token)", function () {
  let nftContract, issuer, receiver, minter, other;

  beforeEach(async function () {
    // Get four accounts: issuer, receiver, minter, and an extra account.
    [issuer, receiver, minter, other] = await ethers.getSigners();

    // Deploy the contract with:
    //  - name = "MyOrgCertificates"
    //  - symbol = "MOC"
    //  - contractDescription = "Sample Contract Description"
    //  - issuer = issuer.address
    //  - minter = minter.address
    //  - baseURI = "ipfs://QmBaseURI/"
    const SoulboundCert = await ethers.getContractFactory("SoulboundCert");
    nftContract = await SoulboundCert.connect(issuer).deploy(
      "MyOrgCertificates",
      "MOC",
      "Sample Contract Description",
      issuer.address,
      minter.address,
      "ipfs://QmBaseURI/"
    );
    await nftContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the correct contract description, issuer, and base URI", async function () {
      const contractDesc = await nftContract.contractDescription();
      expect(contractDesc).to.equal("Sample Contract Description");

      const contractIssuer = await nftContract.issuer();
      expect(contractIssuer).to.equal(issuer.address);

      // There's no direct getter for baseURI in the contract by default,
      // but we can test tokenURI to see if it uses the base URI.
    });
  });

  describe("Non-transferability", function () {
    it("should be soulbound (non-transferable)", async function () {
      // Mint a token using the designated minter.
      const tx = await nftContract.connect(minter).issueCertificate(receiver.address, 0);
      await tx.wait();

      // Confirm token 0 is owned by the receiver.
      expect(await nftContract.ownerOf(0)).to.equal(receiver.address);

      // Any transfer attempt should revert.
      await expect(
        nftContract.connect(receiver).transferFrom(receiver.address, other.address, 0)
      ).to.be.revertedWith("Token is soulbound and non-transferable");

      await expect(
        nftContract.connect(receiver).safeTransferFrom(receiver.address, other.address, 0)
      ).to.be.revertedWith("Token is soulbound and non-transferable");
    });
  });

  describe("Issuer-Minter Interactions", function () {
    it("should allow designated minter to mint tokens", async function () {
      // MINTER_ROLE is assigned to 'minter' (not issuer)
      const tx = await nftContract.connect(minter).issueCertificate(receiver.address, 0);
      await tx.wait();

      // Confirm token 0 is owned by the receiver.
      expect(await nftContract.ownerOf(0)).to.equal(receiver.address);
    });

    it("should not allow issuer to mint tokens if they are not the designated minter", async function () {
      // Attempting to call issueCertificate from the issuer should revert because issuer doesn't have MINTER_ROLE.
      await expect(
        nftContract.connect(issuer).issueCertificate(receiver.address, 0)
      ).to.be.revertedWith("Caller is not designated minter");
    });

    it("should verify that issuer and minter are distinct accounts", async function () {
      // Just confirm that the issuer and minter addresses are different.
      expect(issuer.address).to.not.equal(minter.address);
    });
  });

  describe("Burn Authorization Tests", function () {
    it("should allow burning only by the authorized party (IssuerOnly)", async function () {
      // BurnAuth.IssuerOnly = 0
      const tx = await nftContract.connect(minter).issueCertificate(receiver.address, 0);
      await tx.wait();

      expect(await nftContract.ownerOf(0)).to.equal(receiver.address);
      const burnAuthValue = await nftContract.burnAuth(0);
      expect(burnAuthValue).to.equal(0);

      // Receiver's attempt to burn should revert.
      await expect(nftContract.connect(receiver).burn(0))
        .to.be.revertedWith("Only issuer can burn");

      // Issuer's burn attempt should succeed.
      await expect(nftContract.connect(issuer).burn(0))
        .to.emit(nftContract, "Transfer")
        .withArgs(receiver.address, ethers.ZeroAddress, 0);

      // After burning, querying ownerOf should revert.
      await expect(nftContract.ownerOf(0)).to.be.reverted;
    });

    it("should allow burning only by the token owner (OwnerOnly)", async function () {
      // BurnAuth.OwnerOnly = 1
      const tx = await nftContract.connect(minter).issueCertificate(receiver.address, 1);
      await tx.wait();

      expect(await nftContract.ownerOf(0)).to.equal(receiver.address);
      const burnAuthValue = await nftContract.burnAuth(0);
      expect(burnAuthValue).to.equal(1);

      // Issuer's attempt to burn should revert.
      await expect(nftContract.connect(issuer).burn(0))
        .to.be.revertedWith("Only token owner can burn");

      // Receiver's attempt to burn should succeed.
      await expect(nftContract.connect(receiver).burn(0))
        .to.emit(nftContract, "Transfer")
        .withArgs(receiver.address, ethers.ZeroAddress, 0);

      await expect(nftContract.ownerOf(0)).to.be.reverted;
    });

    it("should allow burning by either issuer or token owner (Both)", async function () {
      // BurnAuth.Both = 2
      // Test issuer burning token 0.
      let tx = await nftContract.connect(minter).issueCertificate(receiver.address, 2);
      await tx.wait();

      expect(await nftContract.ownerOf(0)).to.equal(receiver.address);
      let burnAuthValue = await nftContract.burnAuth(0);
      expect(burnAuthValue).to.equal(2);

      // Issuer burns token 0.
      await expect(nftContract.connect(issuer).burn(0))
        .to.emit(nftContract, "Transfer")
        .withArgs(receiver.address, ethers.ZeroAddress, 0);

      await expect(nftContract.ownerOf(0)).to.be.reverted;

      // Mint a new token (token 1) with Both authorization.
      tx = await nftContract.connect(minter).issueCertificate(receiver.address, 2);
      await tx.wait();

      expect(await nftContract.ownerOf(1)).to.equal(receiver.address);
      burnAuthValue = await nftContract.burnAuth(1);
      expect(burnAuthValue).to.equal(2);

      // Receiver burns token 1.
      await expect(nftContract.connect(receiver).burn(1))
        .to.emit(nftContract, "Transfer")
        .withArgs(receiver.address, ethers.ZeroAddress, 1);

      await expect(nftContract.ownerOf(1)).to.be.reverted;
    });

    it("should not allow burning for tokens with Neither authorization", async function () {
      // BurnAuth.Neither = 3
      const tx = await nftContract.connect(minter).issueCertificate(receiver.address, 3);
      await tx.wait();

      expect(await nftContract.ownerOf(0)).to.equal(receiver.address);
      const burnAuthValue = await nftContract.burnAuth(0);
      expect(burnAuthValue).to.equal(3);

      // Both issuer and receiver attempts should revert.
      await expect(nftContract.connect(issuer).burn(0))
        .to.be.revertedWith("Token is non-burnable");
      await expect(nftContract.connect(receiver).burn(0))
        .to.be.revertedWith("Token is non-burnable");
    });
  });

  describe("Base URI Functionality", function () {
    it("should return the correct tokenURI for minted tokens", async function () {
      // Suppose the baseURI is "ipfs://QmBaseURI/"
      // When we mint token 0, tokenURI(0) should be "ipfs://QmBaseURI/0.json"

      // Mint a token with BurnAuth=0
      const tx = await nftContract.connect(minter).issueCertificate(receiver.address, 0);
      await tx.wait();

      // Check tokenURI
      const uri = await nftContract.tokenURI(0);
      expect(uri).to.equal("ipfs://QmBaseURI/0.json");
    });
  });
});
