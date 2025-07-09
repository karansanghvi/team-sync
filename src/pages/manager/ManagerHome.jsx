import React, { useEffect, useState } from 'react';
import ManagerHeader from '../../components/manager/ManagerHeader';
import "../../index.css";
import ManagerProfile from './ManagerProfile';
import ManagerAnalytics from './ManagerAnalytics';
import ManagerUsers from './ManagerUsers';
import ManagerTeam from './ManagerTeam';
import ManagerCalendar from './ManagerCalendar';
import ManagerMeetings from './ManagerMeetings';
import ManagerDashboard from './ManagerDashboard';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

function ManagerHome() {

  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [managerData, setManagerData] = useState({
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
        const docRef = doc(db, 'managers', userUID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setManagerData({
            firstName: data.firstName || '',
            lastName: data.lastName || ''
          });
        } else {
          console.error("Manager document not found");
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
        return <ManagerProfile />;
      case 'users':
        return <ManagerUsers onSelectSection={setActiveSection} />;
      case 'team':
        return <ManagerTeam onSelectSection={setActiveSection} />;
      case 'analytics':
        return <ManagerAnalytics />;
      case 'calendar':
        return <ManagerCalendar />;
      case 'meetings':
        return <ManagerMeetings />;
      case 'logout':
        handleLogout(); 
        return null;
      default:
        return (
          <>
            <div className='users-container'>
              <h1 className='welcome-title'>{timeGreeting}, {managerData.firstName} {managerData.lastName}</h1>
                <div className='button-container'>
                  <button className='admin-button'>Manager</button>
                </div>
            </div>
            <ManagerDashboard />
          </>
        );
    }
  };

  return (
    <>
      <div className='container'>
        <ManagerHeader onSelectSection={setActiveSection} />
      </div>
      <div className="container">
        {renderContent()}
      </div>
    </>
  );
}

export default ManagerHome;
