const hre = require("hardhat");
const fs = require("fs").promises;
const path = require("path");

async function main() {
  try {
    const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
    const usdt = await MockUSDT.deploy();
    await usdt.waitForDeployment();
    const address = await usdt.getAddress();
    console.log(`MockUSDT deployed to: ${address}`);

    // 生成按网络和时间戳命名的文件
    const network = hre.network.name;
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const filePath = path.join(
      __dirname,
      "..",
      "deployed",
      `deployed-address-${network}-${timestamp}.json`
    );
    await fs.writeFile(
      filePath,
      JSON.stringify({ MockUSDT: address }, null, 2)
    );
    console.log(`✅ 合约地址已保存到 ${filePath}`);
  } catch (error) {
    console.error("❌ 部署失败:", error);
    process.exitCode = 1;
  }
}

main();
