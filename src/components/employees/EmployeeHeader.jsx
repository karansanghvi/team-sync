import React from 'react';
import '../../assets/styles/admin.css';

const EmployeeHeader = ({ onSelectSection }) => {
  return (
    <header className="admin-header">
      <div className="logo">TeamSync</div>

      <nav className="nav-links">
        <button onClick={() => onSelectSection('dashboard')}>Dashboard</button>
        <button onClick={() => onSelectSection('profile')}>Profile</button>
        {/* <button onClick={() => onSelectSection('users')}>Users</button> */}
        <button onClick={() => onSelectSection('team')}>Team</button>
        {/* <button onClick={() => onSelectSection('analytics')}>Analytics</button> */}
        <button onClick={() => onSelectSection('calendar')}>Calendar</button>
        <button onClick={() => onSelectSection('meetings')}>Meetings</button>
        <button className="logout-btn" onClick={() => onSelectSection('logout')}>Logout</button>
      </nav>
    </header>
  );
};

export default EmployeeHeader;
