"use client";

import { useState, useEffect } from 'react'
import Web3 from 'web3'
import Head from "next/head";
import lotteryContract from '../../blockchain/lottery';
import './custom-styles.css'

export default function Home() {

  const [web3, setWeb3] = useState()
  const [address, setAddress] = useState()
  const [lcContract, setLcContract] = useState()
  const [lotteryPot, setLotteryPot] = useState()
  const [lotteryPlayers, setPlayers] = useState([])
  const [lotteryHistory, setLotteryHistory] = useState([])
  const [lotteryId, setLotteryId] = useState()
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    updateState()
  }, [lcContract])

const updateState =() => {
  if (lcContract) getPot();
  if (lcContract) getPlayers()
  if (lcContract) getLotteryId()
}


const connectWalletHandler = async () => {
  setError('')
  if (typeof window !== "undefined" && typeof window.ethereum !== "undefined"){
    try{
      await window.ethereum.request({method: "eth_requestAccounts"});
      const web3 = new Web3(window.ethereum);
      setWeb3(web3);
      const accounts = await web3.eth.getAccounts();
      setAddress(accounts[0]);

      const lc = lotteryContract(web3);
      setLcContract(lc)
    }catch(err){
      setError(err.message);
    }
  }
  else{
    console.log("Please install MetaMask extension in your web browser.");
  }
}

// const payWinnerHandler = async () => {}

const pickWinnerHandler = async () => {
  setError('')
    setSuccessMsg('')
    console.log(`address from pick winner :: ${address}`)
    try {
      await lcContract.methods.pickWinner().send({
        from: address,
        gas: 300000,
        gasPrice: null
      })
    } catch(err) {
      setError(err.message)
    }
}

const enterLotteryHandler = async () => {
  try{
  await lcContract.methods.enterLottery().send({
    from: address,
    value: '15000000000000000', //equal to 0.015 sepolia eth. Smart contract has a check of msg.value > 0.01 eth
    gas: 300000,
    gasPrice: null
  })
  updateState()
}catch(err){
  setError(err.message);
}
}

const getLotteryId = async () => {
  const lotteryId = await lcContract.methods.lottery_ID().call();
  setLotteryId(lotteryId);
  await getHistory(lotteryId)
}

const getHistory = async (id) => {
  setLotteryHistory([])
  for (let i = parseInt(id); i > 0; i--) {
    const winnerAddress = await lcContract.methods.lottery_History(i).call()
    const historyObj = {}
    historyObj.id = i
    historyObj.address = winnerAddress
    setLotteryHistory(lotteryHistory => [...lotteryHistory, historyObj])
  }
}

const getPlayers = async () => {
  console.log('get players');
  const players = await lcContract.methods.getPlayers().call();
  console.log("get players end");
  console.log(players);
  setPlayers(players);
}

const getPot = async () => {
  const potWei = await lcContract.methods.getBalance().call();
  const potEther = web3.utils.fromWei(potWei, 'ether');
  setLotteryPot(potEther);
};

 
  return (
    <div>
   <header>
      <div className='navbar'>
        <div className='lotteryName'>
          <h1>crypto fortune</h1>
        </div>
        <div className='connectButton'>
          <button onClick={connectWalletHandler} className='connectWalletButton'>Connect Wallet</button>
        </div>
      </div>
   </header>

   <main>
    <div className='main'>
      <div className='maincontrols'>
        <div className='Enterlottery'>
          <button onClick={enterLotteryHandler} className='EnterLotteryButton'>Enter Lottery</button>
        </div>
        <div className='PickWinner'>
          <button onClick={pickWinnerHandler} className='PickWinnerButton'>Pick Winner</button>
        </div>
        <div className="errormsg">
          <p>{error}</p>
        </div> 
      </div>
      <div className='mainInfo'>
        <div className='LotteryHistory'>
          <h3>Lottery History</h3>
          {
                          (lotteryHistory && lotteryHistory.length > 0) && lotteryHistory.map(item => {
                            if (lotteryId != item.id) {
                              return <div className="history-entry mt-3" key={item.id}>
                                <div>Lottery #{item.id} winner:</div>
                                <div>
                                  <a href={`https://etherscan.io/address/${item.address}`} target="_blank">
                                    {item.address}
                     </a>
                  </div>
                </div>
              }
            })
          }
        </div>
        <div className='PlayersList'>
          <h3>Players ({lotteryPlayers.length})</h3>
          <ul className="ml-0">
                          {
                            (lotteryPlayers && lotteryPlayers.length > 0) && lotteryPlayers.map((player, index) => {
                              return <li key={`${player}-${index}`}>
                                <a href={`https://etherscan.io/address/${player}`} target="_blank">
                                  {player}
                                </a>
                              </li>
                            })
                          }
                        </ul>
        </div>
        <div className='PotBalance'>
  <h3>Pot Balance</h3>
  {lotteryPot !== undefined && <p>{lotteryPot} Ether</p>}
</div>
      </div>
    </div>

   </main>
  
  </div>
  );
}

