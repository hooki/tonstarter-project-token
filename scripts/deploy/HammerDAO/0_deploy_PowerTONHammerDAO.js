const hre = require("hardhat");
const fs = require("fs");
require('dotenv').config()

async function main() {
  const TON = "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5";
  const WTON = "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2";
  const SEIG_MANAGER = "0x710936500aC59e8551331871Cbad3D33d5e0D909";
  const AUTO_COINASGE_SNAPSHOT = "0x85ca9f611c363065252ea9462c90743922767b55";
  const DIVIDENTPOOL = "0x17332F84Cc0bbaD551Cd16675F406A0a2c55E28C";
  const POWERTON_PROXY = "0x970298189050aBd4dc4F119ccae14ee145ad9371";
  const DAO_AGENDA_MANAGER = "0xcD4421d082752f363E1687544a09d5112cD4f484";
  const DAO_COMMITTEE_PROXY = "0xDD9f0cCc044B0781289Ee318e5971b0139602C26";

  const PowerHammerDAO = await hre.ethers.getContractFactory("PowerTONHammerDAO");
  const powerHammerDAO = await PowerHammerDAO.deploy();

  let tx = await powerHammerDAO.deployed();

  console.log(`txid: ${tx.deployTransaction.hash}`);
  console.log(`PowerTONHammerDAO deployed to: ${powerHammerDAO.address}`);

  // add DAO execution info(call `upgradeTo()` method)
  const PowerTONSwapperProxy = await hre.ethers.getContractFactory("PowerTONSwapperProxy");
  const upgradeToFunc = PowerTONSwapperProxy.interface.getFunction("upgradeTo");
  const executionInfo1 = PowerTONSwapperProxy.interface.encodeFunctionData(upgradeToFunc, [powerHammerDAO.address]);

  // add DAO execution info(call `setInfo()` method)
  const setInfoFunc = powerHammerDAO.interface.getFunction("setInfo");
  const executionInfo2 = powerHammerDAO.interface.encodeFunctionData(setInfoFunc, [WTON, AUTO_COINASGE_SNAPSHOT, SEIG_MANAGER, DIVIDENTPOOL]);

  const DAO_AGENDA_MANAGER_ABI = JSON.parse(fs.readFileSync("./abi/daoAgendaManager.json")).abi;
  const agendaManager = await hre.ethers.getContractAt(DAO_AGENDA_MANAGER_ABI, DAO_AGENDA_MANAGER);

  const noticePeriod = await agendaManager.minimumNoticePeriodSeconds();
  const votingPeriod = await agendaManager.minimumVotingPeriodSeconds();
  const agendaFee = await agendaManager.createAgendaFees();

  const abiCoder = new ethers.utils.AbiCoder();
  const approveData = abiCoder.encode(
    ["address[]", "uint128", "uint128", "bool", "bytes[]"],
    [
      [POWERTON_PROXY, POWERTON_PROXY],
      noticePeriod, votingPeriod, true,
      [executionInfo1, executionInfo2]
    ]
  );
  console.log(approveData);

  const TON_ABI = JSON.parse(fs.readFileSync("./abi/TON.json")).abi;
  const ton = await hre.ethers.getContractAt(TON_ABI, TON);
  await ton.approveAndCall(
    DAO_COMMITTEE_PROXY,
    agendaFee,
    approveData,
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
