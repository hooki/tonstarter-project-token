// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ITOS } from "./ITOS.sol";
import { ILockTOSDividend } from "../interfaces/ILockTOSDividend.sol";
import { iPowerTON } from "./iPowerTON.sol";
import "./IPowerTONSwapperEvent.sol";

import "../interfaces/IIERC20.sol";

import "./SeigManagerI.sol";
import "./Layer2RegistryI.sol";
import "./AutoRefactorCoinageI.sol";

import "../common/AccessibleCommon.sol";
//import "hardhat/console.sol";

contract PowerTONHammerDAO is
    AccessibleCommon,
    iPowerTON,
    IPowerTONSwapperEvent
{

    address public wton;
    ITOS public tos;
    ILockTOSDividend public dividiedPool;
    address public layer2Registry;
    address public seigManager;

    bool public migratedL2;

    modifier onlySeigManagerOrOwner() {
        require(
            isAdmin(msg.sender) ||
            msg.sender == seigManager,
            "PowerTONSwapper: sender is not seigManager or not admin");
        _;
    }

    constructor()
    {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    function setInfo(
        address _wton,
        address _tos,
        address _dividiedPool,
        address _layer2Registry,
        address _seigManager
        )
        external onlyOwner
    {
        wton = _wton;
        tos = ITOS(_tos);
        dividiedPool = ILockTOSDividend(_dividiedPool);
        layer2Registry = _layer2Registry;
        seigManager = _seigManager;
    }

    function approveToDividendPool() external {
        IERC20(wton).approve(
            address(dividiedPool),
            type(uint256).max
        );
    }

    function distribute() external {
        uint256 wtonBalance = getWTONBalance();
        dividiedPool.distribute(wton, wtonBalance);
        emit Distributed(wton, wtonBalance);
    }

    function getWTONBalance() public view returns(uint256) {
        return IERC20(wton).balanceOf(address(this));
    }

    // PowerTON functions
    function currentRound() external override pure returns (uint256) {
        return 0;
    }

    function roundDuration() external override pure returns (uint256) {
        return 0;
    }

    function totalDeposits() external override pure returns (uint256) {
        return 0;
    }

    function winnerOf(uint256 round) external override pure returns (address) {
        return address(0);
    }

    function powerOf(address account) external override pure returns (uint256) {
        return 0;
    }

    function init() external override {
    }

    function start() external override {
    }

    function endRound() external override {
    }

    function onDeposit(address layer2, address account, uint256 amount)
        external override onlySeigManagerOrOwner
    {
        emit OnDeposit(layer2, account, amount);
    }

    function onWithdraw(address layer2, address account, uint256 amount)
        external override onlySeigManagerOrOwner
    {
        emit OnWithdraw(layer2, account, amount);
    }
}
