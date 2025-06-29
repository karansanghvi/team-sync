import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function Dashboard() {
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        navigate('/login');
      } else {
        setFullName(localStorage.getItem('userFullName') || 'User');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const logout = () => {
    signOut(auth);
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="container">
      <h1 className="title">Welcome, {fullName} 👋</h1>
      <button onClick={logout} className="login-button">Logout</button>
    </div>
  );
}

export default Dashboard;
