import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdCalendarToday, MdLocationOn, MdPeople } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import './Event.css';
import '../components/FABPositioning.css';

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  status: 'upcoming' | 'completed';
  category: 'event' | 'news';
}

// Dummy data untuk events
const eventsData: EventData[] = [
  {
    id: '1',
    title: 'Merciku Tech Meetup #12',
    description: 'Join us for an exciting discussion about the latest trends in mobile app development and user experience design. Network with fellow developers and designers.',
    date: '2025-08-25',
    time: '14:00',
    location: 'Gedung Cyber Jakarta',
    participants: 24,
    maxParticipants: 50,
    status: 'upcoming',
    category: 'event'
  },
  {
    id: '2',
    title: 'Workshop: React Native Development',
    description: 'Learn how to build cross-platform mobile applications using React Native. This hands-on workshop covers navigation, state management, and API integration.',
    date: '2025-08-28',
    time: '09:00',
    location: 'Kode Labs Menteng',
    participants: 18,
    maxParticipants: 30,
    status: 'upcoming',
    category: 'event'
  },
  {
    id: '3',
    title: 'Startup Pitch Competition',
    description: 'Present your startup idea to industry experts and potential investors. Winner gets funding and mentorship opportunities.',
    date: '2025-09-05',
    time: '13:00',
    location: 'Jakarta Innovation Hub',
    participants: 32,
    maxParticipants: 100,
    status: 'upcoming',
    category: 'event'
  },
  {
    id: '4',
    title: 'UI/UX Design Workshop',
    description: 'Learn the fundamentals of user interface and user experience design. Perfect for beginners looking to start their design journey.',
    date: '2025-08-15',
    time: '10:00',
    location: 'Design Studio Kemang',
    participants: 25,
    maxParticipants: 25,
    status: 'completed',
    category: 'event'
  },
  {
    id: '5',
    title: 'Career Talk: Tech Industry',
    description: 'Senior professionals share insights about career paths in technology. Q&A session included.',
    date: '2025-08-10',
    time: '19:00',
    location: 'WeWork SCBD',
    participants: 40,
    maxParticipants: 60,
    status: 'completed',
    category: 'event'
  }
];

const newsData: EventData[] = [
  {
    id: 'n1',
    title: 'New Feature: Event Chat Rooms',
    description: 'We have launched event-specific chat rooms where participants can connect and discuss before, during, and after events. Join the conversation!',
    date: '2025-08-22',
    time: '10:00',
    location: 'Online',
    participants: 0,
    maxParticipants: 0,
    status: 'upcoming',
    category: 'news'
  },
  {
    id: 'n2',
    title: 'Partnership with Tech Companies',
    description: 'Merciku has partnered with leading technology companies to bring exclusive opportunities, internships, and job placements to our community members.',
    date: '2025-08-20',
    time: '15:30',
    location: 'Online',
    participants: 0,
    maxParticipants: 0,
    status: 'upcoming',
    category: 'news'
  },
  {
    id: 'n3',
    title: 'Mobile App Update v2.1',
    description: 'Latest app update includes improved navigation, notification system, and better user experience. Update now from your app store!',
    date: '2025-08-18',
    time: '09:00',
    location: 'Online',
    participants: 0,
    maxParticipants: 0,
    status: 'upcoming',
    category: 'news'
  }
];

const tabs = ['Upcoming', 'Completed', 'News'];

const Event: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const getFilteredData = () => {
    switch (activeTab) {
      case 0: // Upcoming
        return eventsData.filter(event => event.status === 'upcoming');
      case 1: // Completed
        return eventsData.filter(event => event.status === 'completed');
      case 2: // News
        return newsData;
      default:
        return [];
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const generateParticipantAvatars = (count: number) => {
    const avatars = [];
    const displayCount = Math.min(count, 3);
    
    for (let i = 0; i < displayCount; i++) {
      avatars.push(
        <div key={i} className="participant-avatar">
          {String.fromCharCode(65 + i)}
        </div>
      );
    }
    
    if (count > 3) {
      avatars.push(
        <div key="more" className="participant-avatar">
          +{count - 3}
        </div>
      );
    }
    
    return avatars;
  };
  return (
    <div className="event-page">
      <AppbarDefault 
        title="Events" 
        onBack={handleBackClick}
      />
      
      <div className="event-tabs">
        {tabs.map((tab, idx) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(idx)} 
            className={activeTab === idx ? 'active' : ''}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="event-content">
        <div className="event-list">
          {getFilteredData().map((item) => (
            <div key={item.id} className="event-card">
              <div className="event-header">
                <h3 className="event-title">{item.title}</h3>
                <span className={`event-status ${item.status}`}>
                  {item.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                </span>
              </div>

              <div className="event-info">
                <div className="event-info-row">
                  <MdCalendarToday className="event-info-icon" />
                  <span>{formatDate(item.date)} • {item.time}</span>
                </div>
                
                {item.location !== 'Online' && (
                  <div className="event-info-row">
                    <MdLocationOn className="event-info-icon" />
                    <span>{item.location}</span>
                  </div>
                )}
                
                {item.category === 'event' && (
                  <div className="event-info-row">
                    <MdPeople className="event-info-icon" />
                    <span>{item.participants}/{item.maxParticipants} participants</span>
                  </div>
                )}
              </div>

              <p className="event-description">{item.description}</p>

              <div className="event-actions">
                {item.category === 'event' && item.status === 'upcoming' && (
                  <>
                    <button className="event-btn primary">
                      Join Event
                    </button>
                    <button className="event-btn secondary">
                      Details
                    </button>
                  </>
                )}
                
                {item.category === 'event' && item.status === 'completed' && (
                  <button className="event-btn secondary">
                    View Results
                  </button>
                )}
                
                {item.category === 'news' && (
                  <button className="event-btn primary">
                    Read More
                  </button>
                )}

                {item.category === 'event' && item.participants > 0 && (
                  <div className="event-participants">
                    <span>Joined:</span>
                    <div className="participant-avatars">
                      {generateParticipantAvatars(item.participants)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {getFilteredData().length === 0 && (
            <div className="empty-state">
              <MdCalendarToday className="empty-icon" />
              <h3>No {tabs[activeTab]}</h3>
              <p>There are no {tabs[activeTab].toLowerCase()} at the moment. Check back later!</p>
            </div>
          )}
        </div>
      </div>

      <FAB 
        icon={<span style={{ fontSize: '24px' }}>🔔</span>}
        ariaLabel="Notifications"
        onClick={handleNotificationClick}
      />
    </div>
  );
};

export default Event;
