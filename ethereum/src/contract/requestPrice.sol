// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title PriceConsumer
 * @dev Get price and description of data feed address
 * @custom:dev-run-script ./scripts/web3-deploy.ts
 */
contract PriceConsumer {

    AggregatorV3Interface internal priceFeed;

    /**
     * @dev Price feed contract constructor
     * @param address of desired feed value
     */
    constructor(address feedAddress) {
        priceFeed = AggregatorV3Interface(feedAddress);
    }

    /**
     * @dev Returns the latest price and the description of feed
     * @return feed latest price and description
     */
    function getLatestPriceAndDescription() public view returns (int, string memory) {
        (
            uint80 roundID,
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        string memory description = priceFeed.description();
        return (price, description);
    }
}
