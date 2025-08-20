import React from 'react';
import { SectionWrapper } from '../components/SectionWrapper';
import { AppbarHomepage } from '../components/AppbarHomepage';
import { FAB } from '../components/FAB';
import BottomNav from '../components/BottomNav';

const Dashboard: React.FC = () => (
  <div className="dashboard-page">
    <AppbarHomepage avatar="/vite.svg" name="User" />
    <div className="dashboard-content">
      <SectionWrapper title="My Account">
        <div>User Info</div>
      </SectionWrapper>
      <SectionWrapper title="My Point">
        <div>100 Points</div>
      </SectionWrapper>
      <SectionWrapper title="Sections">
        <div>Section List</div>
      </SectionWrapper>
    </div>
    <FAB icon={<span>🔔</span>} />
    <BottomNav />
  </div>
);

export default Dashboard;
