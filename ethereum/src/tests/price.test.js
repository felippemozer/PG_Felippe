const { expect } = require("chai");
const { ethers } = require("hardhat");
const { data } = require('../data/feeds.json');


describe("PriceConsumer", function () {
  it("test PriceConsumer contract", async function () {
    const PriceConsumer = await ethers.getContractFactory("PriceConsumer");
    const consumer = await PriceConsumer.deploy();
    await consumer.deployed();
    console.log('price consumer deployed at:'+ consumer.address);
    // VERIFICAR O QUE TESTAR PARA CONFIRMAR O RESULTADO
    expect(await consumer.getLatestPriceAndDescription().description.to.equal());
  });
});
