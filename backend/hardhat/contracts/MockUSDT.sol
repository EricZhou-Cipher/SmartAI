// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("Mock USDT", "USDT") {
        _mint(msg.sender, 1000000000 * 10 ** 6); // 铸造 1000亿 USDT，精度为 6
    }

    // 覆盖 decimals 函数，返回 6
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
