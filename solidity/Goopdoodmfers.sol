// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.2
// Chiru Labs ERC721 v3.1.0

/****************************************************************************
    goopdoodmfers

    8000 Supply

    Written by Oliver Straszynski
    https://github.com/broliver12/
****************************************************************************/

pragma solidity ^0.8.4;

import "./ERC721A_indexExt.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Goopdoodmfers is Ownable, ERC721A_indexExt, ReentrancyGuard {
    // Control Params
    bool private revealed;
    string private baseURI;
    string private notRevealedURI;
    string private baseExtension = ".json";
    bool public whitelistEnabled;
    bool public publicMintEnabled;
    uint256 public immutable totalDevSupply;
    uint256 public immutable totalCollectionSize;

    // Mint Limits
    uint256 public maxMintsWhitelist = 2;
    uint256 public maxMints = 20;

    // Price
    uint256 public unitPrice = 0.01 ether;

    // Supply for devs (< 0.1% of total)
    uint256 private remainingDevSupply = 7;

    // Map of wallets => slot counts
    mapping(address => uint256) public whitelist;

    // Constructor
    constructor() ERC721A_indexExt("goopdoodmfers", "goopdoodmfers") {
        // Set collection size
        totalCollectionSize = 8000;
        // Set dev supply
        totalDevSupply = remainingDevSupply;
    }

    // Ensure caller is a wallet
    modifier isWallet() {
        require(tx.origin == msg.sender, "Cant be a contract");
        _;
    }

    // Ensure there's enough supply to mint the quantity
    modifier enoughSupply(uint256 quantity) {
        require(
            totalSupply() + quantity <= totalCollectionSize,
            "reached max supply"
        );
        _;
    }

    // Mint function for whitelist sale
    // Requires minimum ETH value of unitPrice * quantity
    // Caller must be whitelisted to use this function
    function whitelistMint(uint256 quantity)
        external
        payable
        isWallet
        enoughSupply(quantity)
    {
        require(whitelistEnabled, "Whitelist sale not enabled");
        require(msg.value >= quantity * unitPrice, "Not enough ETH");
        require(whitelist[msg.sender] >= quantity, "No whitelist mints left");
        whitelist[msg.sender] = whitelist[msg.sender] - quantity;
        _safeMint(msg.sender, quantity);
        refundIfOver(quantity * unitPrice);
    }

    // Mint function for public sale
    // Requires minimum ETH value of unitPrice * quantity
    function publicMint(uint256 quantity)
        external
        payable
        isWallet
        enoughSupply(quantity)
    {
        require(publicMintEnabled, "Minting not enabled");
        require(quantity <= maxMints, "Illegal quantity");
        require(
            numberMinted(msg.sender) + quantity <= maxMints,
            "Cant mint that many"
        );
        require(msg.value >= quantity * unitPrice, "Not enough ETH");
        _safeMint(msg.sender, quantity);
        refundIfOver(quantity * unitPrice);
    }

    // Mint function for developers (owner)
    function devMint(uint256 quantity, address recipient)
        external
        onlyOwner
        enoughSupply(quantity)
    {
        require(remainingDevSupply - quantity >= 0, "Not enough dev supply");
        require(quantity <= maxMints, "Illegal quantity");
        remainingDevSupply = remainingDevSupply - quantity;
        _safeMint(recipient, quantity);
    }

    // Returns the correct URI for the given tokenId based on contract state
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(_exists(tokenId), "Nonexistent token");
        if (!revealed) {
            return notRevealedURI;
        }
        return
            bytes(baseURI).length > 0
                ? string(
                    abi.encodePacked(
                        baseURI,
                        Strings.toString(tokenId),
                        baseExtension
                    )
                )
                : "";
    }

    // Set price for whitelist & public mint
    function setPrice(uint256 _price) external onlyOwner {
        unitPrice = _price;
    }

    // Change base metadata URI
    // Only will be called if something fatal happens to initial base URI
    function setBaseURI(string calldata _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    // Only will be called if something fatal happens to initial base URI
    function setBaseExtension(string calldata _baseExtension)
        external
        onlyOwner
    {
        baseExtension = _baseExtension;
    }

    // Change pre-reveal metadata URI
    function setNotRevealedURI(string calldata _notRevealedURI)
        external
        onlyOwner
    {
        notRevealedURI = _notRevealedURI;
    }

    // Set the mint state
    // 1 - Enable whitelist
    // 2 - Enable public mint
    // 0 - Disable whitelist & public mint
    function setMintState(uint256 _state) external onlyOwner {
        if (_state == 1) {
            whitelistEnabled = true;
        } else if (_state == 2) {
            publicMintEnabled = true;
        } else {
            whitelistEnabled = false;
            publicMintEnabled = false;
        }
    }

    // Reveal art
    function reveal(bool _revealed) external onlyOwner {
        revealed = _revealed;
    }

    // Seed whitelist
    function setWhitelist(address[] calldata addrs) external onlyOwner {
        for (uint256 i = 0; i < addrs.length; i++) {
            whitelist[addrs[i]] = maxMintsWhitelist;
        }
    }

    // Returns the amount the address has minted
    function numberMinted(address minterAddr) public view returns (uint256) {
        return _numberMinted(minterAddr);
    }

    // Returns the ownership data for the given tokenId
    function getOwnershipData(uint256 tokenId)
        external
        view
        returns (TokenOwnership memory)
    {
        return _ownershipOf(tokenId);
    }

    // Withdraw entire contract value to owners wallet
    function withdraw() external onlyOwner nonReentrant {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    // Refunds extra ETH if minter sends too much
    function refundIfOver(uint256 price) private {
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
    }
}
