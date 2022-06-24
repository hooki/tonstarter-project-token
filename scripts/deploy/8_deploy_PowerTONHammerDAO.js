const hre = require("hardhat");
require('dotenv').config()
const {
  keccak256,
} = require("web3-utils");
const AutoCoinageSnapshotABI  = require("../../abi/AutoCoinageSnapshot.json");
async function main() {
    const [admin] = await hre.ethers.getSigners();

    const PowerHammerDAO = await hre.ethers.getContractFactory("PowerTONHammerDAO");
    const powerHammerDAO = await PowerHammerDAO.deploy();

    let tx = await powerHammerDAO.deployed();

    console.log("tx:", tx.deployTransaction.hash);
    console.log(tx.deployTransaction);
    console.log("PowerTONHammerDAO deployed to:", powerHammerDAO.address);
    console.log(await tx.deployTransaction.wait())

    // await run("verify", {
    //   address: powerHammerDAO.address,
    //   constructorArgsParams: [],
    // });

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
