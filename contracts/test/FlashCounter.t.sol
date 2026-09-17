// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../src/FlashCounter.sol";

contract FlashCounterTest {
    FlashCounter counter;

    function setUp() public {
        counter = new FlashCounter();
    }

    function test_InitialCountIsZero() public view {
        require(counter.count() == 0, "Initial count should be 0");
    }

    function test_Increment() public {
        uint256 newCount = counter.increment();
        require(newCount == 1, "Count should increment to 1");
        require(counter.count() == 1, "Count should be 1");

        counter.increment();
        require(counter.count() == 2, "Count should be 2");
    }

    function test_Decrement() public {
        counter.increment();
        counter.increment();
        uint256 newCount = counter.decrement();
        require(newCount == 1, "Count should decrement to 1");
        require(counter.count() == 1, "Count should be 1");
    }

    function test_Reset() public {
        counter.increment();
        counter.increment();
        counter.reset();
        require(counter.count() == 0, "Count should reset to 0");
    }

    function test_RevertWhen_DecrementZero() public {
        try counter.decrement() {
            revert("Expected decrement on zero to revert");
        } catch {
            // Revert expected
        }
    }
}
