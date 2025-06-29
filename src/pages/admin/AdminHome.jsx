import React, { useState } from 'react';
import AdminHeader from "../../components/admin/AdminHeader";
import AdminProfile from './AdminProfile';
import Members from './Members';
import Team from './Team';
import Analytics from './Analytics';
import Calendar from './Calendar';

function AdminHome({ fullName, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard');

  const currentHour = new Date().getHours();
  let timeGreeting = 'Good Morning';
  if (currentHour >= 12 && currentHour < 17) {
    timeGreeting = 'Good Afternoon';
  } else if (currentHour >= 17 || currentHour < 4) {
    timeGreeting = 'Good Evening';
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <AdminProfile/>;
      case 'members':
        return <Members/>;
      case 'team':
        return <Team/>;
      case 'analytics':
        return <Analytics/>;
      case 'calendar':
        return <Calendar/>;
      case 'meetings':
        return <Logout/>;
      case 'logout':
        onLogout();
        return
      default:
        return <h1 className='welcome-title'>{timeGreeting}, {fullName}</h1>;
    }
  };

  return (
    <>
      <AdminHeader onSelectSection={setActiveSection} />
      <div className="admin-container">
        {renderContent()}
      </div>
    </>
  );
}

export default AdminHome;
