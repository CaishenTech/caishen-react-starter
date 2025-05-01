'use client'

import './index.css'
import { useState } from 'react';
import { CaishenSDK } from "@caishen/sdk"

export default function App() {
  const [token, setToken] = useState('');
  const [provider, setProvider] = useState('google');
  const [connectionType, setConnectionType] = useState('user');
  const [userId, setUserId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [active_function, setActiveFunction] = useState('not_selected');
  const [chainType, setChainType] = useState('ETHEREUM');
  const [authToken, setAuthToken] = useState('');
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [chainId, setChainId] = useState('');
  const [final_result, setFinalResult] = useState('');
  const [error, setError] = useState('');

  let sdk = null;
  // 
  const display_short = (text, num) => {
    const short = `${text.slice(0, num)}.....${text.slice(-num)}`;
    console.log(short);
    return short
  }
  const handleConnect = async () => {
    try {
      sdk = new CaishenSDK({ projectKey });
      if (connectionType == 'user') {
        const userToken = await sdk.connectAsUser({
          token,
          provider,
        });
        setAuthToken(userToken)
      } else {
        const userToken = await sdk.connectAsAgent({
          userId,
          agentId,
        });
        setAuthToken(userToken)
      }
      setConnected(true);
      setError('');
    } catch (err) {
      setError('Failed to connect: ');
    }
  };

  const handleExecuteFunction = async () => {
    try {
      if (active_function == "get_wallet") {
        const wallet = await sdk.crypto.getWallet({
          chainType: chainType,
          chainId: chainId,
          account: account,
        });
        setFinalResult(wallet)
      } else if (active_function == "get_balance") {
        const balance = await sdk.crypto.getBalance({
          wallet: {
            account: account,
            chainType: chainType,
          },
          payload: { token: token }, // if not provided, native token is used
        });
        setFinalResult(balance)
      } else if (active_function == "send_token") {
        const crypto_send_transaction = await sdk.crypto.send({
          wallet: {
            account: account,
            chainType: chainType,
            chainId: chainId,
          },
          payload: {
            // token?: string;
            amount: amount,
            toAddress: toAddress,
            // memo?: number;
          }
        });
        setFinalResult(crypto_send_transaction)
      } else if (active_function == "cash_deposit") {
        const cash_deposit = await sdk.cash.deposit({
            account: account,
            tokenAddress: tokenAddress,
            amount: amount,
            chainId: chainId,
          });
        setFinalResult(cash_deposit)
      } else if (active_function == "cash_withdraw") {
        const cash_withdraw = await sdk.cash.withdraw({
          account: account,
          tokenAddress: tokenAddress,
          amount: amount,
          chainId: chainId,
        });
        setFinalResult(cash_withdraw)
      } else if (active_function == "cash_get_balance") {
        const balance = await sdk.cash.getBalance({ account: account });
        setFinalResult(balance)
      } else {
        const cash_send_transaction = await sdk.cash.send({
          toAddress: toAddress,
          amount: amount,
          account: account
        });
        setFinalResult(cash_send_transaction)
      }
      setError('');
    } catch (err) {
      setError('Failed to connect: ');
    }
  }

  return (
    <div className="App"> 
      <div>
        <label>Enter Project Key:</label>
        <input type="text" value={projectKey} onChange={(e) => setProjectKey(e.target.value)} placeholder="Enter your projectKey" />
      </div>
      <div>
        <label> Connection Type:</label>
        <select value={connectionType} onChange={(e) => setConnectionType(e.target.value)}>
          <option value="user">User</option>
          <option value="agent">Agent</option>
        </select>
      </div>
      {connectionType == 'user' && 
      <div>
        <div>
          <label>Select Provider:</label>
          <select value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="google">Google</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter</option>
            <option value="discord">Discord</option>
            <option value="github">GitHub</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </div>
        <div>
          <label>Enter Token:</label>
          <input type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Enter user token" />
        </div>
      </div>
      }
      {connectionType == 'agent' && <div>
        <div>
          <label>Enter Agent Id:</label>
          <input type="text" value={agentId} onChange={(e) => setAgentId(e.target.value)} placeholder="Enter agent id" />
        </div>
        <div>
          <label>Enter User Id:</label>
          <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Enter user id" />
        </div>
      </div>}
      <button onClick={handleConnect}>Connect</button>

      {authToken && (
        <div className="mt-4">
          <p><strong>Auth Token:</strong> {display_short(authToken, 5)}</p>
          <p><strong>Connected:</strong> {connected ? 'Yes' : 'No'}</p>

          <div>
            <label>Select API Function:</label>
            <select value={active_function} onChange={(e) => setActiveFunction(e.target.value)}>
                <option value="get_wallet">Get Wallet</option>
                <option value="send_token">send_token</option>
                <option value="get_balance">Get Balance</option>
                <option value="cash_deposit">Cash Deposit</option>
                <option value="cash_withdraw">Cash Withdraw</option>
                <option value="cash_get_balance">Cash Get Balance</option>
                <option value="cash_send">Cash Send</option>
              </select>
           </div>
           {active_function != "not_selected" && <div>
              <div>
                <label>Chain Type:</label>
                <select value={chainType} onChange={(e) => setChainType(e.target.value)}>
                  <option value="ethereum">ETHEREUM</option>
                  <option value="solana">SOLANA</option>
                  <option value="bitcoin">BITCOIN</option>
                </select>
              </div>
              <div>
                <label>Chain Id:</label>
                <input type="text" value={chainId} onChange={(e) => setChainId(e.target.value)} placeholder="Enter chain Id" />
              </div>
              <div>
                <label>account:</label>
                <input type="text" value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Enter account" />
              </div>
              {(active_function == "send_token" || active_function == "cash_deposit" || active_function == "cash_withdraw" || active_function == "cash_send") && <div>
                <label>Token:</label>
                <input type="text" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} placeholder="Enter token" />
              </div>}
              {(active_function == "send_token" || active_function == "cash_deposit" || active_function == "cash_withdraw") && <div>
                <label>amount:</label>
                <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />
              </div>}
              {(active_function == "send_token" || active_function == "cash_send") && <div>
                <label>toAddress:</label>
                <input type="text" value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="Enter to address" />
              </div>}
            </div>}
          <button onClick={handleExecuteFunction}>Run</button>
          <div>
              {final_result}
          </div>
        </div>
      )}
    </div>
  );
}
