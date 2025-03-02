// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./IERC5484.sol";

contract SoulboundCert is ERC721, AccessControl, IERC5484 {
    // Define a role identifier for the minter role.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// The designated issuer.
    address public issuer;
    
    /// On-chain transcript data.
    string public transcript;
    
    /// Counter for token IDs.
    uint256 private _currentTokenId;
    
    /// Mapping to store burn authorization for each token.
    mapping(uint256 => BurnAuth) private _burnAuth;

    constructor(
        string memory name_,
        string memory symbol_,
        string memory transcript_,
        address issuer_,
        address minter_
    ) ERC721(name_, symbol_) {
        transcript = transcript_;
        issuer = issuer_;

        // Set up roles:
        // The issuer becomes the default admin.
        _setupRole(DEFAULT_ADMIN_ROLE, issuer_);
        // Grant the minter role to the designated minting wallet.
        _setupRole(MINTER_ROLE, minter_);
    }

    /// @notice Issues a new soulbound token with a predetermined burn authorization.
    /// Can only be called by an account with MINTER_ROLE.
    function issueToken(address to, BurnAuth burnAuthType) external {
        require(hasRole(MINTER_ROLE, msg.sender), "Caller is not designated minter");
        uint256 tokenId = _currentTokenId;
        _mint(to, tokenId);
        _burnAuth[tokenId] = burnAuthType;
        emit Issued(issuer, to, tokenId, burnAuthType);
        _currentTokenId++;
    }

    /// @notice Returns the burn authorization for a given token.
    function burnAuth(uint256 tokenId) external view override returns (BurnAuth) {
        require(_exists(tokenId), "Query for nonexistent token");
        return _burnAuth[tokenId];
    }

    /// @notice Allows burning of a token according to its predetermined burn authorization.
    function burn(uint256 tokenId) external {
        address tokenOwner = ownerOf(tokenId);
        BurnAuth auth = _burnAuth[tokenId];
        
        if (auth == BurnAuth.IssuerOnly) {
            require(msg.sender == issuer, "Only issuer can burn");
        } else if (auth == BurnAuth.OwnerOnly) {
            require(msg.sender == tokenOwner, "Only token owner can burn");
        } else if (auth == BurnAuth.Both) {
            require(msg.sender == issuer || msg.sender == tokenOwner, "Not authorized to burn");
        } else {
            revert("Token is non-burnable");
        }
        
        _burn(tokenId);
    }

    /// @dev Override _transfer to prevent transfers (making tokens soulbound).
    function _transfer(address from, address to, uint256 tokenId) internal override {
        revert("Token is soulbound and non-transferable");
    }


    /// @notice Resolves the multiple inheritance conflict between ERC721 and AccessControl.
    /// It ensures that the contract properly reports support for all interfaces declared in its parent contracts.   
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

}
