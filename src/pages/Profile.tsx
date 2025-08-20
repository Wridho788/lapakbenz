import React from 'react';
import { SectionWrapper } from '../components/SectionWrapper';
import { FAB } from '../components/FAB';

const Profile: React.FC = () => (
  <div className="profile-page">
    <SectionWrapper title="User Data">
      <div>Name: User</div>
      <div>Email: user@email.com</div>
      <button>Edit</button>
    </SectionWrapper>
    <FAB icon={<span>✎</span>} />
  </div>
);

export default Profile;
