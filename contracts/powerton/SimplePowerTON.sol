// SPDX-License-Identifier: MIT
pragma solidity >0.8.0;
pragma experimental ABIEncoderV2;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ITOS } from "./ITOS.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import { iPowerTON } from "./iPowerTON.sol";
import "./IPowerTONSwapperEvent.sol";

import "../interfaces/IIERC20.sol";

import "./SeigManagerI.sol";
import "./Layer2RegistryI.sol";
import "./AutoRefactorCoinageI.sol";

import "../common/AccessibleCommon.sol";
//import "hardhat/console.sol";

contract SimplePowerTON is
    AccessibleCommon,
    iPowerTON,
    IPowerTONSwapperEvent
{

    address public wton;
    ITOS public tos;
    ISwapRouter public uniswapRouter;
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
        address _uniswapRouter,
        address _layer2Registry,
        address _seigManager
        )
        external onlyOwner
    {
        wton = _wton;
        tos = ITOS(_tos);
        uniswapRouter = ISwapRouter(_uniswapRouter);
        layer2Registry = _layer2Registry;
        seigManager = _seigManager;
    }

    function approveToUniswap() external {
        IERC20(wton).approve(
            address(uniswapRouter),
            type(uint256).max
        );
    }

    function swap(
        uint24 _fee,
        uint256 _deadline,
        uint256 _amountOutMinimum,
        uint160 _sqrtPriceLimitX96
    )
        external
    {
        uint256 wtonBalance = getWTONBalance();

        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: wton,
                tokenOut: address(tos),
                fee: _fee,
                recipient: address(this),
                deadline: block.timestamp + _deadline,
                amountIn: wtonBalance,
                amountOutMinimum: _amountOutMinimum,
                sqrtPriceLimitX96: _sqrtPriceLimitX96
            });
        ISwapRouter(uniswapRouter).exactInputSingle(params);

        uint256 burnAmount = tos.balanceOf(address(this));
        tos.burn(address(this), burnAmount);

        emit Swapped(burnAmount);
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
