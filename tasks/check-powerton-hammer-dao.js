require('./utils.js').imports()

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
    "function claim(address)"
  ]

  const WTON = "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2";
  const TOS = "0x409c4D8cd5d2924b9bc5509230d16a61289c8153";
  const LAYER2REGISTRY = "0x0b3E174A2170083e770D5d4Cf56774D221b7063e";
  const SeigManagerOwner = "0x15280a52e79fd4ab35f4b9acbb376dcd72b44fd1";
  const SeigManagerAddress = "0x710936500aC59e8551331871Cbad3D33d5e0D909";
  const OPERATOR = "0x5d9a0646c46245a8a3b4775afb3c54d07bcb1764";
  const HOLDER = "0x4D145A5e90736ad71cBF0081366625BD9eb170Cc";
  const DIVIDENTPOOL = "0x17332F84Cc0bbaD551Cd16675F406A0a2c55E28C"
  
  const PowerTONContract = await ethers.getContractFactory("PowerTONHammerDAO");
  const powerTon = await PowerTONContract.deploy();
  await powerTon.deployed();

  await powerTon.setInfo(WTON, TOS, DIVIDENTPOOL, LAYER2REGISTRY, SeigManagerAddress);

  console.log(`PowerTON : ${powerTon.address}`);

  start_impersonate(SeigManagerOwner);
  await network.provider.send('hardhat_setBalance', [SeigManagerOwner, hex(parseEth(10000))]);
  const seigManager = await ethers.getContractAt(ABI, SeigManagerAddress, await ethers.getSigner(SeigManagerOwner));

  await seigManager.setPowerTON(powerTon.address);

  mining(0x100000);

  const operator = await ethers.getContractAt(ABI, OPERATOR);
  await operator.updateSeigniorage();

  const wton = await ethers.getContractAt("IERC20", WTON);
  console.log(`PowerTON's WTON Balance ${await wton.balanceOf(powerTon.address) / 1e27}`);

  console.log(`[BEFORE] sTOS holder's WTON Balance ${await wton.balanceOf(HOLDER) / 1e27}`);
  await powerTon.approveToDividendPool();
  await powerTon.distribute();

  mining(0x100000);
  
  start_impersonate(HOLDER);
  const dividentPool = await ethers.getContractAt(ABI, DIVIDENTPOOL, await ethers.getSigner(HOLDER));
  await dividentPool.claim(WTON);
  console.log(`[AFTER] sTOS holder's WTON Balance ${await wton.balanceOf(HOLDER) / 1e27}`);
});