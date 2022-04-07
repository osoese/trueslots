// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

contract Slots {
    
    uint public slotsBalance;
    uint public minValue = 0.001 ether;
    uint modulus = 6;
    uint256 randNonce = 0;

    struct Game {
        uint result;
        uint randNumber1;
        uint randNumber2;
        uint randNumber3;
    }

    mapping(address=>uint) winnerBalance;
    mapping(address=>Game[]) gamesResult;

    address owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function changeMinValue(uint newMinValue) public onlyOwner {
        minValue = newMinValue * (1 ether);
    }

    function deposit() public payable onlyOwner {
        slotsBalance += msg.value;
    }

    function getBalanceSlots() public view returns (uint) {
        return slotsBalance;
    }

    function getPlayerBalance() public view returns (uint) {
        return winnerBalance[msg.sender];
    }

    function getLastPlayerGame() public view returns (uint, uint, uint, uint) {
        uint length = gamesResult[msg.sender].length - 1;
        return (gamesResult[msg.sender][length].result, gamesResult[msg.sender][length].randNumber1, gamesResult[msg.sender][length].randNumber2, gamesResult[msg.sender][length].randNumber3);
    }

    function roll() public payable {
        require(minValue >= msg.value);
        uint randNumber1 = randomValue();
        randNonce += 1;
        uint randNumber2 = randomValue();
        randNonce += 1;
        uint randNumber3 = randomValue();
        randNonce += 1;
        uint result = calculatePrize(randNumber1, randNumber2, randNumber3);
        if (result == 0) {
            slotsBalance += msg.value;
        } else {
            winnerBalance[msg.sender] += result;
        }
        gamesResult[msg.sender].push(Game(result, randNumber1, randNumber2, randNumber3));
    }

    function randomValue() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % modulus;
    }

    function calculatePrize(uint rand1, uint rand2, uint rand3) private view returns(uint) {
        if(rand1 == 5 && rand2 == 5 && rand3 == 5) {
            return minValue * 30;
        } else if (rand1 == 6 && rand2 == 5 && rand3 == 6) {
            return minValue * 20;
        } else if (rand1 == 4 && rand2 == 4 && rand3 == 4) {
            return minValue * 15;
        } else if (rand1 == 3 && rand2 == 3 && rand3 == 3) {
            return minValue * 12;
        } else if (rand1 == 2 && rand2 == 2 && rand3 == 2) {
            return minValue * 10;
        } else if (rand1 == 1 && rand2 == 1 && rand3 == 1) {
            return minValue * 5;
        } else if ((rand1 == rand2) || (rand1 == rand3) || (rand2 == rand3)) {
            return minValue;
        } else {
            return 0;
        }
    }

    function withdraw(uint amount) public {
        require(winnerBalance[msg.sender] >= amount);
        winnerBalance[msg.sender] -= amount;
        slotsBalance -= amount;
        payable(msg.sender).transfer(amount);
    }
}