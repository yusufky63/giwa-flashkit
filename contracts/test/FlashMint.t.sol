// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../src/FlashMint.sol";

contract FlashMintTest {
    FlashMint minter;

    function setUp() public {
        minter = new FlashMint();
    }

    function test_InitialState() public view {
        require(minter.totalMinted() == 0, "Initial minted should be 0");
        require(minter.MAX_SUPPLY() == 10000, "Max supply should be 10000");
    }

    function test_Mint() public {
        uint256 tokenId = minter.mint();
        require(tokenId == 1, "First token ID should be 1");
        require(minter.totalMinted() == 1, "Total minted should be 1");
        require(minter.balanceOf(address(this)) == 1, "Balance should be 1");
        require(minter.ownerOf(1) == address(this), "Owner should be caller");
    }

    function test_MultipleMints() public {
        minter.mint();
        uint256 secondId = minter.mint();
        require(secondId == 2, "Second token ID should be 2");
        require(minter.totalMinted() == 2, "Total minted should be 2");
        require(minter.balanceOf(address(this)) == 2, "Balance should be 2");
    }
}
