// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ILockTOSDividend } from "../interfaces/ILockTOSDividend.sol";
import { iPowerTON } from "./iPowerTON.sol";

import "./IPowerTONSwapperEvent.sol";
import "./SeigManagerI.sol";
import "../common/AccessibleCommon.sol";

contract PowerTONHammerDAO is
    AccessibleCommon,
    iPowerTON,
    IPowerTONSwapperEvent
{
    // WTON 컨트랙트 주소
    address public wton;
    // sTOS 홀더에게 에어드랍하기 위한 LockTOSDividendProxy 컨트랙트
    ILockTOSDividend public lockTOSDividendProxy;

    constructor()
    {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    /// @dev PowerTON 컨트랙트가 동작하는데 필요한 변수들 설정
    /// @param _wton WTON 토큰 주소
    /// @param _lockTOSDividendProxy sTOS 홀더들에게 에어드랍하는 컨트랙트 주소
    function setInfo(
        address _wton,
        address _lockTOSDividendProxy
        )
        external onlyOwner
    {
        wton = _wton;
        lockTOSDividendProxy = ILockTOSDividend(_lockTOSDividendProxy);
    }

    /// @dev sTOS 홀더들에게 에어드랍하는 컨트랙트에 WTON 위임(approve)
    function approveToDividendPool() external {
        IERC20(wton).approve(
            address(lockTOSDividendProxy),
            type(uint256).max
        );
    }

    /// @dev PowerTON 컨트랙트에 적립된 WTON을 sTOS 홀더들에게 에어드랍하는 함수
    /// @notice WTON을 approve 하기 위해 approveToDividendPool를 먼저 호출해야함
    function distribute() external {
        uint256 wtonBalance = getWTONBalance();
        lockTOSDividendProxy.distribute(wton, wtonBalance);
        emit Distributed(wton, wtonBalance);
    }

    function getWTONBalance() public view returns(uint256) {
        return IERC20(wton).balanceOf(address(this));
    }


    /// @dev 하위 호환성을 위해 남겨진 함수 제거하면 compile 실패
    function currentRound() external override pure returns (uint256) {
        return 0;
    }

    /// @dev 하위 호환성을 위해 남겨진 함수 제거하면 compile 실패
    function roundDuration() external override pure returns (uint256) {
        return 0;
    }

    /// @dev 하위 호환성을 위해 남겨진 함수 제거하면 compile 실패
    function totalDeposits() external override pure returns (uint256) {
        return 0;
    }

    /// @dev 하위 호환성을 위해 남겨진 함수 제거하면 compile 실패
    function winnerOf(uint256 round) external override pure returns (address) {
        round;
        return address(0);
    }

    /// @dev 하위 호환성을 위해 남겨진 함수 제거하면 compile 실패
    function powerOf(address account) external override pure returns (uint256) {
        account;
        return 0;
    }

    /// @dev 하위 호환성을 위해 남겨진 함수 제거하면 compile 실패
    function init() external override {
    }

    /// @dev 하위 호환성을 위해 남겨진 함수 제거하면 compile 실패
    function start() external override {
    }

    /// @dev 하위 호환성을 위해 남겨진 함수 제거하면 compile 실패
    function endRound() external override {
    }

    /// @dev 하위 호환성을 위해 남겨진 함수 제거하면 compile 실패
    function onDeposit(address layer2, address account, uint256 amount)
        external override onlyOwner
    {
        emit OnDeposit(layer2, account, amount);
    }

    /// @dev 하위 호환성을 위해 남겨진 함수 제거하면 compile 실패
    function onWithdraw(address layer2, address account, uint256 amount)
        external override onlyOwner
    {
        emit OnWithdraw(layer2, account, amount);
    }
}
