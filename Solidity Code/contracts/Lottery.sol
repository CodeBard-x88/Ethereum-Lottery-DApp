// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//smart Contract address : 0x7CF7F34C1149A75d3160e123AF9070d2E041275A

contract Lottery{
    address owner;
    uint public lottery_ID;
    address payable[] players;
    mapping (uint => address payable ) public lottery_History;


    constructor(){
        owner = msg.sender;
        lottery_ID = 1;
    }

    // this event can be used to get the list of lottries won by a particular player
    event playerWon(address payable indexed winner,uint lotteryNo);

    //this event can be used for 2 puroposes:
    //1) To get the lottery Numbers in which a particular participated
    //2) To get the list of players that participated in a particular lottery
    event newPlayer(address payable indexed new_Player, uint indexed lotteryNo);

   
    modifier onlyOwner(){
        require(msg.sender == owner, "You are not allowed to access this function.");
        _;
    }

    function enterLottery() public payable {
        require(msg.value > .01 ether, "You dont have sufficient amount for paricipating in lottery.");
        players.push(payable(msg.sender));
        emit newPlayer(payable(msg.sender), lottery_ID);
    } 

    function pickWinner() public onlyOwner  {
        uint index =  getRandomNumber()%players.length;
        players[index].transfer(address(this).balance);
        lottery_History[lottery_ID] = players[index];
        emit playerWon(players[index], lottery_ID);
        lottery_ID++;
        
        players = new address payable[](0);
    }

    function getRandomNumber() public view returns(uint){
        //abi.encodePacked will concatentate all the arguments give to it
        return uint(keccak256(abi.encodePacked(owner,block.timestamp)));
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }

    function getPlayers() public view returns(address payable[] memory){
        return players;
    }

    function getLotetryHistoryByID(uint id) public view returns(address payable){
        require(id != 0, "Invalid Lottery id.");
        require(id < lottery_ID, "This lottery has not been played yet.");
        return lottery_History[id];
    }

    function getLotteryHistory() public view returns(address payable) {
        //it will return the winner of the very last lottery
        return lottery_History[lottery_ID - 1];
    }
}