async function main() {

  const [deployer] = await ethers.getSigners();

  console.log(
  "Deploying contracts with the account:",
  deployer.address
  );

  const Contract = await hre.ethers.getContractFactory("Lottery");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();        // do not use contract.deployed() as it won't work and will give error
  console.log(`Contract deployed to: ${contract.target}`); // do not use contract.address as it will print undefined

}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});