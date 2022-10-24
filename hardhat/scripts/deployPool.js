const { ethers, upgrades } = require("hardhat");

async function main() {
  const [admin] = await ethers.getSigners();
  console.log("Admin: ", admin);

  const CasinoPool = await ethers.getContractFactory("JustPool");
  const pool = await upgrades.deployProxy(CasinoPool);
  await pool.deployed();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
