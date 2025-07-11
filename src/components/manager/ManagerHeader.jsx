import React from 'react';
import '../../assets/styles/admin.css';

const ManagerHeader = ({ onSelectSection }) => {
  return (
    <header className="admin-header">
      <div className="logo">TeamSync</div>

      <nav className="nav-links">
        <button onClick={() => onSelectSection('dashboard')}>Dashboard</button>
        <button onClick={() => onSelectSection('profile')}>Profile</button>
        <button onClick={() => onSelectSection('users')}>Users</button>
        <button onClick={() => onSelectSection('team')}>Team</button>
        <button onClick={() => onSelectSection('tasks')}>Tasks</button>
        <button onClick={() => onSelectSection('documents')}>Documents</button>
        <button onClick={() => onSelectSection('calendar')}>Calendar</button>
        <button onClick={() => onSelectSection('meetings')}>Meetings</button>
        <button className="logout-btn" onClick={() => onSelectSection('logout')}>Logout</button>
      </nav>
    </header>
  );
};

export default ManagerHeader;
