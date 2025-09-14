const { ethers } = require("ethers");

const ERC20_ABI = [
    "function decimals() view returns (uint8)",
    "function balanceOf(address account) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)"
];

const tokenAddress = process.env.CONTRACT_ADDRESS; // USDT contract

async function sendUsdtWithdrawal({ toAddress, amount,PRIVATE_KEY=null }) {
    try {
        if (!ethers.isAddress(toAddress)) {
            throw new Error("❌ Invalid wallet address");
        }
        const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC);
        const wallet = new ethers.Wallet( PRIVATE_KEY ?? process.env.PRIVATE_KEY, provider);
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
        const decimals = await contract.decimals();
        const parsedAmount = ethers.parseUnits(amount.toString(), decimals);
        const balance = await contract.balanceOf(wallet.address);
        if (balance < parsedAmount) throw new Error("❌ Insufficient USDT balance");
        const tx = await contract.transfer(toAddress, parsedAmount);
        await tx.wait();
        console.log(`✅ USDT Sent: ${amount} → ${toAddress} | Hash: ${tx.hash}`);
        return tx.hash;
    } catch (error) {
        console.error("❌ USDT transfer error:", error.message);
        return null;
    }
}

module.exports = { sendUsdtWithdrawal };
