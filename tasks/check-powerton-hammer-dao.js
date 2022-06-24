require('./utils.js').imports()

 /* 
  [ 스크립트 실행 결과 ]
    $ npx hardhat check-powerton-hammer-dao
    PowerTON : 0x51C65cd0Cdb1A8A8b79dfc2eE965B1bA0bb8fc89
    PowerTON's WTON Balance 337302.7457927709
    [BEFORE] sTOS holder's WTON Balance 0
    [AFTER] sTOS holder's WTON Balance 5411.248094277198
 */

const latestTimestamp = async () => {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}

const getBlockNumbrer = async () => {
  const block = await ethers.provider.getBlock("latest");
  return block.number;
}

task('check-powerton-hammer-dao').setAction(async () => {
  const ABI = [
    "function setPowerTON(address)",
    "function updateSeigniorage()",
    "function claim(address)",
    "function setInfo(address,address,address,address)",
    "function approveToDividendPool()",
    "function distribute()",
    "function upgradeTo(address)"
  ]

  const WTON = "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2";
  const SEIG_MANAGER_ONWER = "0x15280a52e79fd4ab35f4b9acbb376dcd72b44fd1";
  const SEIG_MANAGER = "0x710936500aC59e8551331871Cbad3D33d5e0D909";
  const AUTO_COINASGE_SNAPSHOT = "0x85ca9f611c363065252ea9462c90743922767b55";
  const HAMMER_DAO = "0x5d9a0646c46245a8a3b4775afb3c54d07bcb1764";
  const HOLDER = "0x4D145A5e90736ad71cBF0081366625BD9eb170Cc";
  const DIVIDENTPOOL = "0x17332F84Cc0bbaD551Cd16675F406A0a2c55E28C";
  const POWERTON_SWAPPER_PROXY = "0x970298189050aBd4dc4F119ccae14ee145ad9371";
  const POWERTON_SWAPPER_PROXY_OWNER = "0x15280a52e79fd4ab35f4b9acbb376dcd72b44fd1";
  
  const powerTONContract = await ethers.getContractFactory("PowerTONHammerDAO");
  const powerTon = await powerTONContract.deploy();
  await powerTon.deployed();

  await network.provider.send('hardhat_setBalance', [
    POWERTON_SWAPPER_PROXY_OWNER,
    hex(parseEth(10000)),
  ]);

  start_impersonate(POWERTON_SWAPPER_PROXY_OWNER);
  const powerTONProxy = await ethers.getContractAt(ABI, POWERTON_SWAPPER_PROXY, await ethers.getSigner(POWERTON_SWAPPER_PROXY_OWNER));
  await powerTONProxy.upgradeTo(powerTon.address);

  await powerTONProxy.setInfo(WTON, AUTO_COINASGE_SNAPSHOT, SEIG_MANAGER, DIVIDENTPOOL);

  console.log(`PowerTON : ${powerTon.address}`);

  start_impersonate(SEIG_MANAGER_ONWER);
  await network.provider.send('hardhat_setBalance', [SEIG_MANAGER_ONWER, hex(parseEth(10000))]);
  const seigManager = await ethers.getContractAt(ABI, SEIG_MANAGER, await ethers.getSigner(SEIG_MANAGER_ONWER));

  await seigManager.setPowerTON(powerTon.address);

  mining(0x100000);

  const operator = await ethers.getContractAt(ABI, HAMMER_DAO);
  await operator.updateSeigniorage();

  const wton = await ethers.getContractAt("IERC20", WTON);
  console.log(`PowerTON's WTON Balance ${await wton.balanceOf(powerTon.address) / 1e27}`);

  console.log(`[BEFORE] powerTONProxy's WTON Balance ${await wton.balanceOf(powerTONProxy.address) / 1e27}`);
  console.log(`[BEFORE] sTOS holder's WTON Balance ${await wton.balanceOf(HOLDER) / 1e27}`);
  // await powerTONProxy.approveToDividendPool();
  await powerTONProxy.distribute();

  mining(0x100000);
  
  start_impersonate(HOLDER);
  const dividentPool = await ethers.getContractAt(ABI, DIVIDENTPOOL, await ethers.getSigner(HOLDER));
  await dividentPool.claim(WTON);
  console.log(`[AFTER] powerTONProxy's WTON Balance ${await wton.balanceOf(powerTONProxy.address) / 1e27}`);
  console.log(`[AFTER] sTOS holder's WTON Balance ${await wton.balanceOf(HOLDER) / 1e27}`);
});