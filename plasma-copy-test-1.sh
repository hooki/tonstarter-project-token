npx hardhat compile
cp -r ../plasma-evm-contracts/artifacts/contracts/* ./artifacts/contracts
cp -r ../ico20-contracts/artifacts/contracts/* ./artifacts/contracts
npx hardhat test test/tokenDividendPool-cases.test.js --no-compile --network hardhat
