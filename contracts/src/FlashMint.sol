// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title FlashMint
 * @notice Minimal test mint contract for contract write lifecycle demos on GIWA.
 * @dev Testnet only. Has no economic value.
 */
contract FlashMint {
    string public name = "FlashKit Demo Pass";
    string public symbol = "FLASH";

    uint256 public totalMinted;
    uint256 public constant MAX_SUPPLY = 10000;

    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public ownerOf;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event FlashMinted(address indexed recipient, uint256 indexed tokenId, uint256 timestamp);

    function mint() external returns (uint256) {
        require(totalMinted < MAX_SUPPLY, "FlashMint: Max supply reached");

        uint256 tokenId = totalMinted + 1;
        totalMinted = tokenId;

        balanceOf[msg.sender] += 1;
        ownerOf[tokenId] = msg.sender;

        emit Transfer(address(0), msg.sender, tokenId);
        emit FlashMinted(msg.sender, tokenId, block.timestamp);

        return tokenId;
    }
}
