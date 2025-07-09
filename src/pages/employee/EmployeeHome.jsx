import React, { useEffect, useState } from 'react';
import "../../index.css";
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import TeamLeadHeader from '../../components/teamLead/TeamLeadHeader';
import EmployeeProfile from './EmployeeProfile';
import EmployeeTeams from './EmployeeTeams';
import EmployeeCalendar from './EmployeeCalendar';
import EmployeeMeetings from './EmployeeMeetings';
import EmployeeDashboard from './EmployeeDashboard';
import EmployeeHeader from '../../components/employees/EmployeeHeader';

function EmployeeHome() {

  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [employeeData, setEmployeeData] = useState({
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
        const docRef = doc(db, 'employees', userUID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setEmployeeData({
            firstName: data.firstName || '',
            lastName: data.lastName || ''
          });
        } else {
          console.error("Employee document not found");
          navigate('/login');
        }
      } catch (error) {
        console.error("Error fetching employee data: ", error);
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
        return <EmployeeProfile />;
      // case 'users':
      //   return <TeamLeadUsers onSelectSection={setActiveSection} />;
      case 'team':
        return <EmployeeTeams onSelectSection={setActiveSection} />;
    //   case 'analytics':
    //     return <TeamLeadAnalytics />;
      case 'calendar':
        return <EmployeeCalendar />;
      case 'meetings':
        return <EmployeeMeetings />;
      case 'logout':
        handleLogout(); 
        return null;
      default:
        return (
          <>
            <div className='users-container'>
              <h1 className='welcome-title'>{timeGreeting}, {employeeData.firstName} {employeeData.lastName}</h1>
                <div className='button-container'>
                  <button className='admin-button'>Employee</button>
                </div>
            </div>
            <EmployeeDashboard />
          </>
        );
    }
  };

  return (
    <>
      <div className='container'>
        <EmployeeHeader onSelectSection={setActiveSection} />
      </div>
      <div className="container">
        {renderContent()}
      </div>
    </>
  );
}

export default EmployeeHome;
