const { expect, assert } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");


describe("Casino tests", function () {
    let instance;
    let admin, alice, bob, charlie

    before(async () => {
        [admin, alice, bob, charlie] = await ethers.getSigners();

        const CasinoPool = await ethers.getContractFactory("JustPool");
        instance = await upgrades.deployProxy(CasinoPool);
    });

    it("MainTest", async () => {
        const poolUserRole = await instance.POOL_USER_ROLE();
        const accessTx = await instance.grantRole(poolUserRole, alice.address);
        await accessTx.wait();

        const bobBrings = await (await instance.connect(bob)).provideLiquidity({value: "1000000000000000000"});
        await bobBrings.wait();
        const charlieBrings = await (await instance.connect(charlie)).provideLiquidity({value: "2000000000000000000"});
        await charlieBrings.wait();

        const adminBalanceBefore = await admin.getBalance();
        const aliceTakes = await (await instance.connect(alice)).send(admin.address, "300000000000000000");
        await aliceTakes.wait();
        const adminBalanceAfter = await admin.getBalance();
        expect(adminBalanceAfter.sub(adminBalanceBefore).toString()).to.be.equal("300000000000000000");
        
        const bobBalanceBefore = await bob.getBalance();
        const bobRemovesLiq = await (await instance.connect(bob)).removeLiquidity(await instance.balanceOf(bob.address));
        await bobRemovesLiq.wait();
        const bobBalanceAfter = await bob.getBalance();
        expect(bobBalanceAfter.sub(bobBalanceBefore).toString()).to.be.equal("899940912077411998");

        const aliceReturns = await alice.sendTransaction({
            from: alice.address,
            to: instance.address,
            value: "1000000000000000000"
        });
        await aliceReturns.wait();
        
        const charlieBalanceBefore = await charlie.getBalance();
        const charlieRemovesLiq = await (await instance.connect(charlie)).removeLiquidity(await instance.balanceOf(charlie.address));
        await charlieRemovesLiq.wait();
        const charlieBalanceAfter = await charlie.getBalance();
        expect(charlieBalanceAfter.sub(charlieBalanceBefore).toString()).to.be.equal("2799950646566412748");
        
    });
})