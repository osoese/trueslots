// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

abstract contract Randomizer {
    uint256 modulus = 6;
    uint256 randNonce = 0;

    function randomValue() internal view returns (uint256) {
        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp +
                        block.difficulty +
                        randNonce +
                        ((
                            uint256(keccak256(abi.encodePacked(block.coinbase)))
                        ) / (block.timestamp)) +
                        block.gaslimit +
                        ((uint256(keccak256(abi.encodePacked(msg.sender)))) /
                            (block.timestamp)) +
                        block.number
                )
            )
        );

        return (seed - ((seed / modulus) * modulus));
    }
}
