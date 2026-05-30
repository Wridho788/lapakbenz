import React from 'react';
import { MdPerson, MdOutlineHistory, MdOutlineAccountBalanceWallet } from 'react-icons/md';
import './UserCard.css';

export type UserCardProps = {
  points: number;
  userName?: string;
  onProfileClick?: () => void;
  onEventHistoryClick?: () => void;
  onTransactionClick?: () => void;
};

export const UserCard: React.FC<UserCardProps> = ({
  points,
  userName = 'User',
  onProfileClick,
  onEventHistoryClick,
  onTransactionClick,
}) => {
  const capitalizeName = (name: string) => {
    if (!name) return 'User';
    return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const formatPoints = (value: number): string => value.toLocaleString('id-ID');

  return (
    <div className="user-card">
      <div className="user-card-avatar-section">
       
        <span className="avatar-name">{capitalizeName(userName || 'User')}</span>
      </div>
      <div className="user-card-points">
        <div className="point-text">
          <h3 className="point-label">My Point</h3>
          <p className="point-value">{formatPoints(points)}</p>
        </div>
        <div className="point-image">
          <img src="/lapakbenz.png" alt="Merci Points" width={110} height={'9vh'} />
        </div>
      </div>

      <div className="user-card-divider"></div>

      <div className="user-card-buttons">
        <button className="user-card-button" onClick={onProfileClick}>
          <div className="button-icon"><MdPerson /></div>
          <span className="button-label">Profil</span>
        </button>
        <button className="user-card-button" onClick={onEventHistoryClick}>
          <div className="button-icon"><MdOutlineHistory /></div>
          <span className="button-label">Riwayat Event</span>
        </button>
        <button className="user-card-button" onClick={onTransactionClick}>
          <div className="button-icon"><MdOutlineAccountBalanceWallet /></div>
          <span className="button-label">Transaksi</span>
        </button>
      </div>
    </div>
  );
};