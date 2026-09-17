// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../src/FlashCounter.sol";
import "../src/FlashMint.sol";

/**
 * @title DeployFlashKitContracts
 * @notice Deployment script for FlashKit demo contracts on GIWA Sepolia.
 * @dev Usage:
 *   forge script script/Deploy.s.sol --rpc-url https://sepolia-rpc.giwa.io --broadcast
 */
contract DeployFlashKitContracts {
    function run() external returns (address counterAddress, address mintAddress) {
        FlashCounter counter = new FlashCounter();
        FlashMint minter = new FlashMint();

        counterAddress = address(counter);
        mintAddress = address(minter);
    }
}
