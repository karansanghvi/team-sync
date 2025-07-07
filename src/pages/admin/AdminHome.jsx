import React, { useState } from 'react';
import AdminHeader from "../../components/admin/AdminHeader";
import AdminProfile from './AdminProfile';
import Users from './Users';
import Team from './Team';
import Analytics from './Analytics';
import Calendar from './Calendar';
import AdminDashboard from './AdminDashboard';

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
      // case 'profile':
      //   return <AdminProfile/>;
      case 'users':
        return <Users onSelectSection = {setActiveSection} />;
      case 'team':
        return <Team onSelectSection = {setActiveSection} />;
      // case 'analytics':
      //   return <Analytics/>;
      case 'calendar':
        return <Calendar/>;
      // case 'meetings':
      //   return <Logout/>;
      case 'logout':
        onLogout();
        return
      default:
        return (
          <div>
            <h1 className='welcome-title'>{timeGreeting}, {fullName}</h1>
            <AdminDashboard />
          </div>
        );
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
