// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract JustPool is ERC20Upgradeable, OwnableUpgradeable, AccessControlUpgradeable {
    bytes32 public constant POOL_USER_ROLE = keccak256("POOL_USER_ROLE");
    
    function initialize() public initializer {
        __ERC20_init("JustPool", "JP");
        __Ownable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function provideLiquidity() public payable {
        _mint(msg.sender, msg.value);
    }

    function removeLiquidity(uint256 shares) public {
        uint256 etherToReturn = address(this).balance * shares / totalSupply();
        _burn(msg.sender, shares);
        (bool success, ) = msg.sender.call{value: etherToReturn}("");
        require(success);
    }

    function send(address payable receiver, uint256 amount) public {
        require(hasRole(POOL_USER_ROLE, msg.sender));
        (bool success, ) = receiver.call{value: amount}("");
        require(success);
    }

    receive() external payable {}
}