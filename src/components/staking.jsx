import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { DUMMY_TOKEN, provider, STAKING_CONTRACT } from "../web3";
import DummyTokenABI from "../../abi/erc20.json"; // Path to ABI's JSON file
import MEME_VAULT_ABI from "../../abi/memevault.json"; // Path to ABI's JSON file

// const DUMMY_TOKEN_ADDRESS = "0x35520fFcCFf5fE5b1860d8C561c83059Fb52b464";
// const DUMMY_TOKEN = new ethers.Contract(DUMMY_TOKEN_ADDRESS, DummyTokenABI);



const Deposit = ({ account }) => {
    const [amount, setAmount] = useState("");

    const handleDeposit = async event => {
        event.preventDefault();

        // Replace with the appropriate addresses
        const tokenAddress = "0x35520fFcCFf5fE5b1860d8C561c83059Fb52b464";
        const vaultAddress = "0x326A7E9F6Efb0Da6F3a91BDb2611c14597034826";

        // Create a signer instance
        const signer = provider.getSigner(account);
        
        // Connect to the ERC20 Token contract
        const erc20Token = new ethers.Contract(tokenAddress, DummyTokenABI, signer);
        const amountToDeposit = ethers.utils.parseUnits(amount, 18); // assuming 18 decimal places

        // Approve the MemeVault to use your tokens
        const allowance = await erc20Token.allowance(account, vaultAddress);

        if (allowance.lt(amountToDeposit)) {
            const tx = await erc20Token.approve(vaultAddress, amountToDeposit);
            await tx.wait();
        }

        // Connect to the MemeVault contract
        const memeVault = new ethers.Contract(vaultAddress, MEME_VAULT_ABI, signer);

        // Deposit the tokens to the MemeVault
        const tx = await memeVault.deposit(tokenAddress, amountToDeposit, account);
        await tx.wait();
    };

    return (
        <form onSubmit={handleDeposit}>
            <label htmlFor="amount">Locking Amount:</label>
            <input
                type="number"
                id="amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
            />
            <button type="submit">Lock Tokens</button>
        </form>
    );
};

const getStakingViews = async account => {
    const signer = provider.getSigner(account);
    const staking = STAKING_CONTRACT.connect(signer);
    const [staked, reward, totalStaked] = await Promise.all([
        staking.stakedOf(account),
        staking.rewardOf(account),
        staking.totalStaked(),
    ]);
    return {
        staked: ethers.utils.formatEther(staked),
        reward: ethers.utils.formatEther(reward),
        totalStaked: ethers.utils.formatEther(totalStaked),
    };
};

const Staking = ({ account }) => {
    const [views, setViews] = useState({});
    const [stake, setStake] = useState("");
    const [withdraw, setWithdraw] = useState("");

    const handleStake = async event => {
        event.preventDefault();
        const signer = provider.getSigner(account);
        const amount = ethers.utils.parseEther(stake);

        const dummyToken = DUMMY_TOKEN.connect(signer);
        const allowance = await dummyToken.allowance(
            account,
            STAKING_CONTRACT.address
        );
        if (allowance.lt(amount)) {
            const tx = await dummyToken.approve(
                STAKING_CONTRACT.address,
                amount
            );
            await tx.wait();
        }

        const staking = STAKING_CONTRACT.connect(signer);

        const tx = await staking.stake(amount);
        await tx.wait();
    };

    const handleWithdraw = async event => {
        event.preventDefault();
        const signer = provider.getSigner(account);
        const staking = STAKING_CONTRACT.connect(signer);

        const amount = ethers.utils.parseEther(withdraw);
        const tx = await staking.withdraw(amount);
        await tx.wait();
    };

    const handleClaimReward = async () => {
        const signer = provider.getSigner(account);
        const staking = STAKING_CONTRACT.connect(signer);

        const tx = await staking.mintLTREATS();
        await tx.wait();
    };

    useEffect(() => {
        getStakingViews(account, provider).then(setViews).catch(console.error);
    }, [account, provider]);

    if (!views.staked) {
        return (
            <div>
                
                <h2>MemeVault Stats - Current deposit rate: 777x</h2>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div>
            <h2>Current deposit rate: 777x</h2>
            <h2>Locking</h2>
            <p>
                <strong>Locked: </strong> {views.staked} PUPS
            </p>
            <p>
                <strong>Reward: </strong> {views.reward} TREATS
            </p>
            <p>
                <strong>Total Locked: </strong> {views.totalStaked} PUPS
            </p>
            <div style={{ display: "flex" }}>
                <form onSubmit={handleStake}>
                    <label htmlFor="stake">Lock</label>
                    <input
                        id="stake"
                        placeholder="0.0 DT"
                        value={stake}
                        onChange={e => setStake(e.target.value)}
                    />
                    <button type="submit">Lock PUPS</button>
                </form>
                <form onSubmit={handleWithdraw}>
                    <label htmlFor="withdraw">Withdraw</label>
                    <input
                        id="withdraw"
                        placeholder="0.0 TREATS"
                        value={withdraw}
                        onChange={e => setWithdraw(e.target.value)}
                    />
                    <button type="submit">Withdraw DTW</button>
                </form>
            </div>
            <button onClick={handleClaimReward}>Claim TREATS</button>
        </div>
    );
};

export default Deposit;
