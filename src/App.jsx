import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import DummyToken from "./components/dummyToken";
import Staking from "./components/staking";
import Deposit from "./components/staking";
import { provider } from "./web3";
import DummyTokenABI from "../abi/erc20.json"; // Path to ABI's JSON file

const DUMMY_TOKEN_ADDRESS = "0x35520fFcCFf5fE5b1860d8C561c83059Fb52b464";
const DUMMY_TOKEN = new ethers.Contract(DUMMY_TOKEN_ADDRESS, DummyTokenABI);

const Balance = ({ account }) => {
    const [balance, setBalance] = useState("");

    useEffect(() => {
        const getBalance = async () => {
            const dummyToken = DUMMY_TOKEN.connect(provider);
            const balance = await dummyToken.balanceOf(account);
            return ethers.utils.formatEther(balance);
        };
        getBalance().then(setBalance).catch(console.error);
    }, [account, provider]);

    if (!balance) {
        return <p>Loading...</p>;
    }
    return <p>Balance: {balance} PUPS</p>;
};

function App() {
    const [account, setAccount] = useState(null);

    const checkAccounts = async () => {
        if (!window.ethereum) {
            return null;
        }
        const [account] = await window.ethereum.request({
            method: "eth_accounts",
        });
        window.ethereum.on("accountsChanged", accounts => {
            setAccount(accounts[0]);
        });
        return account;
    };

    const requestAccounts = async () => {
        if (!window.ethereum) {
            return null;
        }
        const [account] = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        return account;
    };

    useEffect(() => {
        checkAccounts().then(setAccount).catch(console.error);
    }, []);

    return (
        <div>
            <h1>🐶🐸PuppyFrog MemeVault dApp</h1>
            {account ? (
                <p>
                    Account:{" "}
                    <code style={{ display: "inline" }}>{account}</code>
                </p>
            ) : (
                <button onClick={() => requestAccounts()}>
                    Connect Wallet
                </button>
            )}
            {provider && account && (
                <>
                    <Balance account={account} />
                    <Staking account={account} />
                    <DummyToken account={account} />
                    
                    {/* <Deposit account={account} />  */}
                </>
            )}
        </div>
    );
}

export default App;
