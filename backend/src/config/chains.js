import { ethers } from "ethers";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取 ABI 文件
const transferAbi = JSON.parse(
  readFileSync(join(__dirname, "../abis/Transfer.json"), "utf8")
);

// 链配置
export const chains = {
  hardhat: {
    name: "Hardhat",
    chainId: 31337,
    rpc: {
      ws: "ws://127.0.0.1:8545",
      http: "http://127.0.0.1:8545",
    },
    contract: {
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      abi: transferAbi,
    },
    blockRange: {
      start: 0,
      end: "latest",
    },
    riskConfig: {
      amountThresholds: {
        low: ethers.parseEther("10"),
        medium: ethers.parseEther("50"),
        high: ethers.parseEther("100"),
      },
      timeWindow: 24 * 60 * 60,
      maxTransactionsPerWindow: 100,
    },
  },
  ethereum: {
    name: "Ethereum",
    chainId: 1,
    rpc: {
      ws: process.env.ETH_NODE_WSS || "ws://localhost:8545",
      http: process.env.ETH_NODE_HTTP || "http://localhost:8545",
    },
    contract: {
      address: process.env.ETH_CONTRACT_ADDRESS,
      abi: transferAbi,
    },
    blockRange: {
      start: parseInt(process.env.ETH_START_BLOCK) || 0,
      end: process.env.ETH_END_BLOCK || "latest",
    },
    riskConfig: {
      amountThresholds: {
        low: ethers.parseEther("0.1"),
        medium: ethers.parseEther("1"),
        high: ethers.parseEther("10"),
      },
      timeWindow: 24 * 60 * 60, // 24小时
      maxTransactionsPerWindow: 100,
    },
  },
  polygon: {
    name: "Polygon",
    chainId: 137,
    rpc: {
      ws: process.env.POLYGON_NODE_WSS,
      http: process.env.POLYGON_NODE_HTTP,
    },
    contract: {
      address: process.env.POLYGON_CONTRACT_ADDRESS,
      abi: transferAbi,
    },
    blockRange: {
      start: parseInt(process.env.POLYGON_START_BLOCK) || 0,
      end: process.env.POLYGON_END_BLOCK || "latest",
    },
    riskConfig: {
      amountThresholds: {
        low: ethers.parseEther("100"), // Polygon 的阈值更高
        medium: ethers.parseEther("1000"),
        high: ethers.parseEther("10000"),
      },
      timeWindow: 24 * 60 * 60,
      maxTransactionsPerWindow: 200,
    },
  },
  arbitrum: {
    name: "Arbitrum",
    chainId: 42161,
    rpc: {
      ws: process.env.ARBITRUM_NODE_WSS,
      http: process.env.ARBITRUM_NODE_HTTP,
    },
    contract: {
      address: process.env.ARBITRUM_CONTRACT_ADDRESS,
      abi: transferAbi,
    },
    blockRange: {
      start: parseInt(process.env.ARBITRUM_START_BLOCK) || 0,
      end: process.env.ARBITRUM_END_BLOCK || "latest",
    },
    riskConfig: {
      amountThresholds: {
        low: ethers.parseEther("0.1"),
        medium: ethers.parseEther("1"),
        high: ethers.parseEther("10"),
      },
      timeWindow: 24 * 60 * 60,
      maxTransactionsPerWindow: 150,
    },
  },
};

// 获取指定链的配置
export function getChainConfig(chainId) {
  // 将 chainId 转换为数字
  const chainIdNumber = Number(chainId);
  const chain = Object.values(chains).find((c) => c.chainId === chainIdNumber);
  if (!chain) {
    throw new Error(`Chain ID ${chainId} not supported`);
  }
  return chain;
}

// 获取所有支持的链 ID
export function getSupportedChainIds() {
  return Object.values(chains).map((c) => c.chainId);
}

// 获取链的 RPC Provider
export async function getChainProvider(chainId) {
  const chain = getChainConfig(chainId);
  return new ethers.WebSocketProvider(chain.rpc.ws);
}

// 获取链的合约实例
export async function getChainContract(chainId) {
  const chain = getChainConfig(chainId);
  const provider = await getChainProvider(chainId);
  return new ethers.Contract(
    chain.contract.address,
    chain.contract.abi,
    provider
  );
}
