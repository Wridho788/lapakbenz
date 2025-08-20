import React, { useState } from 'react';
import { SectionWrapper } from '../components/SectionWrapper';
import { FAB } from '../components/FAB';
import BottomNav from '../components/BottomNav';

const tabs = ['Upcoming', 'Completed', 'News'];

const Event: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="event-page">
      <div className="event-tabs">
        {tabs.map((tab, idx) => (
          <button key={tab} onClick={() => setActiveTab(idx)} className={activeTab === idx ? 'active' : ''}>
            {tab}
          </button>
        ))}
      </div>
      <SectionWrapper title={tabs[activeTab]}>
        <div>Event/News List</div>
      </SectionWrapper>
      <FAB icon={<span>＋</span>} />
      <BottomNav />
    </div>
  );
};

export default Event;
