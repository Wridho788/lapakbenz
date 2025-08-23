import React from 'react';
import { MdPerson, MdRedeem } from 'react-icons/md';
import { MdOutlineHistory, MdOutlineAccountBalanceWallet } from 'react-icons/md';
import './ButtonGrid.css';

export type ButtonGridProps = {
  onProfileClick?: () => void;
  onEventHistoryClick?: () => void;
  onTransactionClick?: () => void;
  onRedeemClick?: () => void;
};

export const ButtonGrid: React.FC<ButtonGridProps> = ({
  onProfileClick,
  onEventHistoryClick,
  onTransactionClick,
  onRedeemClick
}) => {
  return (
    <div className="button-grid">
      <button className="grid-button" onClick={onProfileClick}>
        <div className="button-icon">
          <MdPerson />
        </div>
        <span className="button-label">Profile</span>
      </button>

      <button className="grid-button" onClick={onEventHistoryClick}>
        <div className="button-icon">
          <MdOutlineHistory />
        </div>
        <span className="button-label">Event History</span>
      </button>

      <button className="grid-button" onClick={onTransactionClick}>
        <div className="button-icon">
          <MdOutlineAccountBalanceWallet />
        </div>
        <span className="button-label">Transaction</span>
      </button>

      <button className="grid-button" onClick={onRedeemClick}>
        <div className="button-icon">
          <MdRedeem />
        </div>
        <span className="button-label">Redeem</span>
      </button>
    </div>
  );
};
