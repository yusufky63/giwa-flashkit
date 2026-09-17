// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title FlashCounter
 * @notice Minimal state contract for demonstration & benchmarking on GIWA Flashblocks.
 * @dev Testnet only. Has no economic value.
 */
contract FlashCounter {
    uint256 public count;

    event Incremented(address indexed caller, uint256 newCount, uint256 timestamp);
    event Decremented(address indexed caller, uint256 newCount, uint256 timestamp);
    event Reset(address indexed caller, uint256 timestamp);

    function increment() external returns (uint256) {
        count += 1;
        emit Incremented(msg.sender, count, block.timestamp);
        return count;
    }

    function decrement() external returns (uint256) {
        require(count > 0, "FlashCounter: count is zero");
        count -= 1;
        emit Decremented(msg.sender, count, block.timestamp);
        return count;
    }

    function reset() external {
        count = 0;
        emit Reset(msg.sender, block.timestamp);
    }
}
