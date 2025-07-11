import React, { useEffect, useState } from 'react';
import "../../index.css";
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import TeamLeadProfile from './TeamLeadProfile';
// import TeamLeadUsers from './TeamLeadUsers';
import TeamLeadTeams from './TeamLeadTeams';
// import TeamLeadAnalytics from './TeamLeadAnalytics';
import TeamLeadCalendar from './TeamLeadCalendar';
import TeamLeadMeetings from './TeamLeadMeetings';
import TeamLeadHeader from '../../components/teamLead/TeamLeadHeader';
import TeamLeadDashboard from './TeamLeadDashboard';

function TeamLeadHome() {

  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [teamLeadData, setTeamLeadData] = useState({
    firstName: '',
    lastName: ''
  });

  const currentHour = new Date().getHours();
  let timeGreeting = 'Good Morning';
  if (currentHour >= 12 && currentHour < 17) {
    timeGreeting = 'Good Afternoon';
  } else if (currentHour >= 17 || currentHour < 4) {
    timeGreeting = 'Good Evening';
  };

  useEffect(() => {
    const fetchManagerDetails = async () => {
      const userUID = localStorage.getItem('userUID');
      if (!userUID) {
        navigate('/login');
        return;
      }

      try {
        const docRef = doc(db, 'teamLeads', userUID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTeamLeadData({
            firstName: data.firstName || '',
            lastName: data.lastName || ''
          });
        } else {
          console.error("TeamLead document not found");
          navigate('/login');
        }
      } catch (error) {
        console.error("Error fetching manager data: ", error);
        navigate('/login');
      }
    };

    fetchManagerDetails();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <TeamLeadProfile />;
      // case 'users':
      //   return <TeamLeadUsers onSelectSection={setActiveSection} />;
      case 'team':
        return <TeamLeadTeams onSelectSection={setActiveSection} />;
      // case 'analytics':
      //   return <TeamLeadAnalytics />;
      case 'calendar':
        return <TeamLeadCalendar />;
      case 'meetings':
        return <TeamLeadMeetings />;
      case 'logout':
        handleLogout(); 
        return null;
      default:
        return (
          <>
            <div className='users-container'>
              <h1 className='welcome-title'>{timeGreeting}, {teamLeadData.firstName} {teamLeadData.lastName}</h1>
                <div className='button-container'>
                  <button className='admin-button'>Team Lead</button>
                </div>
            </div>
            <TeamLeadDashboard />
          </>
        );
    }
  };

  return (
    <>
      <div className='container'>
        <TeamLeadHeader onSelectSection={setActiveSection} />
      </div>
      <div className="container">
        {renderContent()}
      </div>
    </>
  );
}

export default TeamLeadHome;
