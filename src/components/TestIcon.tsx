import React from 'react';
import { MdNotifications } from 'react-icons/md';

export const TestIcon: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      background: '#f0f0f0', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px' 
    }}>
      <span>Test Icon:</span>
      <MdNotifications style={{ fontSize: '24px', color: '#161129' }} />
      <span>Should be visible</span>
    </div>
  );
};
