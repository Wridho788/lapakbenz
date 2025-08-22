import { MdNotifications } from 'react-icons/md';

const IconTest = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      left: '10px', 
      background: 'red', 
      padding: '10px',
      zIndex: 9999
    }}>
      <MdNotifications style={{ fontSize: '30px', color: 'white' }} />
      <span style={{ color: 'white' }}>Test</span>
    </div>
  );
};

export default IconTest;
