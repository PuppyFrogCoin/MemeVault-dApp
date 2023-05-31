import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { DUMMY_TOKEN, DUMMY_TOKEN_ADDRESS, provider } from "../web3";
import MEME_VAULT_ABI from "../../abi/memevault.json"; // Path to ABI's JSON file

const TREATS_TOKEN_ADDRESS= "0x326A7E9F6Efb0Da6F3a91BDb2611c14597034826";

const getBalanceVault = async account => {
    const dummyToken = DUMMY_TOKEN.connect(provider);

    // Replace with MemeVault address
    const vaultAddress = "0x326A7E9F6Efb0Da6F3a91BDb2611c14597034826";
    const memeVault = new ethers.Contract(vaultAddress, MEME_VAULT_ABI, provider);
    // Get the deposit amount by calling the userDeposits function in the MemeVault contract
    const depositIndex = 0;
    const { amount } = await memeVault.userDeposits(account, depositIndex);


    return [ethers.utils.formatEther(amount)];
};

const getBalanceAndClaimed = async account => {
    const dummyToken = DUMMY_TOKEN.connect(provider);
    const [balance, claimed] = await Promise.all([
        dummyToken.balanceOf(account),
        dummyToken.hasClaimed(account),
    ]);
    return [ethers.utils.formatEther(balance), claimed];
};

const addDummyTokenToMetaMask = async () => {
    if (!window.ethereum) {
        return false;
    }
    try {
        await window.ethereum.request({
            method: "wallet_watchAsset",
            params: {
                type: "ERC20",
                options: {
                    address: DUMMY_TOKEN_ADDRESS,
                    symbol: "PUPS",
                    decimals: 18,
                },
            },
        });
    } catch (error) {
        console.error(error);
    }
};

const addTreatsTokenToMetaMask = async () => {
    if (!window.ethereum) {
        return false;
    }
    try {
        await window.ethereum.request({
            method: "wallet_watchAsset",
            params: {
                type: "ERC20",
                options: {
                    address: TREATS_TOKEN_ADDRESS,
                    symbol: "LTREATS",
                    decimals: 18,
                },
            },
        });
    } catch (error) {
        console.error(error);
    }
};


const DummyToken = ({ account }) => {
    const [balance, setBalance] = useState("");
    const [claimed, setClaimed] = useState(false);

    const claim = async () => {
        const signer = provider.getSigner();
        const vaultAddress = "0x326A7E9F6Efb0Da6F3a91BDb2611c14597034826";
        const memeVault = new ethers.Contract(vaultAddress, MEME_VAULT_ABI, provider);
        // Get the deposit amount by calling the userDeposits function in the MemeVault contract

        const VaultToken = memeVault.connect(signer);
        const tx = await VaultToken.mintLTREATS();
        const receipt = await tx.wait();
        console.log(receipt);

        getBalanceAndClaimed(account, provider)
            .then(([balance, claimed]) => {
                setBalance(balance);
                setClaimed(claimed);
            })
            .catch(console.error);
    };

    // useEffect(() => {
    //     getBalanceAndClaimed(account, provider)
    //         .then(([balance, claimed]) => {
    //             setBalance(balance);
    //             setClaimed(claimed);
    //         })
    //         .catch(console.error);
    // }, [provider, account]);

    useEffect(() => {
        getBalanceVault(account, provider)
            .then(([balance]) => {
                setBalance(balance);
                // setClaimed(claimed);
            })
            .catch(console.error);
    }, [provider, account]);

    if (!balance) {
        return (
            <div>
                <h2>Locked PUPS</h2>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div>
            <h2>MemeVault Stat</h2>
            <p>
                <strong>Current deposit rate: 777x</strong> 
            </p>
            <p>
                <strong>Locked PUPS balance:</strong> {balance} 
            </p>
            {claimed ? (
                <p>You have already claimed your LTREATS</p>
            ) : (
                <button onClick={claim}>Claim TREATS</button>
            )}
            <button onClick={addDummyTokenToMetaMask}>Add PUPS to MetaMask</button>
            <button onClick={addTreatsTokenToMetaMask}>Add TREATS to MetaMask</button>
        </div>
    );
};

export default DummyToken;
