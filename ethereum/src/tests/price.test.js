const { ethers } = require("hardhat");
const { data } = require('../data/feeds.json');

const DIVISOR = 100000000;

/**
 * Get some random data feeds hash in the feeds.json file
 * @returns Some of the data feeds hashes to be included in the contract
 */
function getRandomHash() {
    const props = Object.getOwnPropertyNames(data.rinkeby.hashes);
    const index = Math.floor(Math.random() * props.length);
    const propName = props[index];
    const someHash = data.rinkeby.hashes[propName];

    return [propName, someHash];
}

const hash = getRandomHash();

describe("PriceConsumer", function () {
  it("test PriceConsumer contract", async function () {
    const PriceConsumer = await ethers.getContractFactory("PriceConsumer");
    console.log(`Feed: ${hash[0]}\n`);
    const consumer = await PriceConsumer.deploy(hash[1]);
    const startTime = performance.now();
    await consumer.deployed();
    const finishTime = performance.now();
    console.log('price consumer deployed at:'+ consumer.address);
    const result = await consumer.getLatestPriceAndDescription();
    console.log(`\nPrice of ${result[1]} is ${parseFloat(result[0].toString())/DIVISOR}`);
    console.log(`\nTime of execution: ${(finishTime - startTime)/1000} seconds\n`);
  });
});
