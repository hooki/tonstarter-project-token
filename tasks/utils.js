const utils = {
  set:(k, v) => hre.config.tbond = Object.assign(Object(hre.config.tbond), {[k]:v}),
  hex:v => `0x${v.toHexString().match(/(0x[0]+)([a-fA-F0-9]*)/)[2]}`,
  sum:(...args) => eval(args.map(Number.parseFloat).join('+')),
  parseEth:v => ethers.utils.parseUnits(Number.parseInt(v).toString(), 18),
  parseTon:v => ethers.utils.parseUnits(Number.parseInt(v).toString(), 18),
  parsewTon:v => ethers.utils.parseUnits(Number.parseInt(v).toString(), 27),
  fromTon:v => ethers.utils.formatUnits(ethers.BigNumber.from(v), 18),
  fromwTon:v => ethers.utils.formatUnits(ethers.BigNumber.from(v), 27),
  mining:async n => await hre.network.provider.send('hardhat_mine', [`0x${n.toString(16)}`]),
  start_impersonate:async addr => await hre.network.provider.send('hardhat_impersonateAccount',[addr]),
  stop_impersonate:async addr => await hre.network.provider.send('hardhat_stopImpersonatingAccount', [addr]),
}

module.exports = { imports:() => Object.keys(utils).forEach(id => global[id] = utils[id]) }