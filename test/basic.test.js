const {
    ether,
    BN,
    expectRevert
} = require('@openzeppelin/test-helpers');

const chai = require('chai');
const { expect } = chai;
chai.use(require('chai-bn')(BN)); // allow chai to work with BN

const Slots = artifacts.require('Slots');

contract('Slots', (accounts) => {
  const [owner, user1, user2] = accounts;

  let slots;

  before(async () => {
    slots = await Slots.deployed();
  });

  it('Check initial values', async () => {
    expect(await slots.owner()).to.be.equal(owner);
    expect(await slots.minValue()).to.be.a.bignumber.that.equals(ether('0.001'));
    expect(await slots.sumPlayersMoney()).to.be.a.bignumber.that.equals(new BN('0'));
    expect(await slots.getSlotsBalance()).to.be.a.bignumber.that.equals(new BN('0'));
    expect(await slots.getMyBalance({ from: owner })).to.be.a.bignumber.that.equals(ether('0'));
    expect(await slots.getMyBalance({ from: user1 })).to.be.a.bignumber.that.equals(ether('0'));
    expect(await slots.getMyBalance({ from: user2 })).to.be.a.bignumber.that.equals(ether('0'));
});

  it('Change min value - only owner', async () => {
    await expectRevert(slots.changeMinValue(ether('1'), { from: user1 }), 'only owner');
    await slots.changeMinValue(ether('0.01'), { from: owner });
    expect(await slots.minValue()).to.be.a.bignumber.that.equals(ether('0.01'));
  });

  it('Deposit - only owner', async () => {
    await expectRevert(slots.deposit({ from: owner }), 'zero deposit');
    await expectRevert(slots.deposit({ from: user1, value: ether('1') }), 'only owner');
    await slots.deposit({ from: owner, value: ether('1') });
    expect(await slots.getSlotsBalance()).to.be.a.bignumber.that.equals(ether('1'));
  });
});
