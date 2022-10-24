const SLOTS = "0xdB8322C016127FbD7A751865c6957e3e8970cF81";
const POOL = "0x644bfe49ca2d652bd46ba113e61cbfa903ce968b";

async function main() {
  const [admin] = await ethers.getSigners();

  const Pool = await ethers.getContractFactory("JustPool", admin);
  const pool = await Pool.attach(POOL);

  const ROLE = await pool.POOL_USER_ROLE();
  const grantRoleTx = await pool.grantRole(ROLE, SLOTS);
  await grantRoleTx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

