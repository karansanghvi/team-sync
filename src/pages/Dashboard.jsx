import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AdminHome from './admin/AdminHome';

function Dashboard() {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        navigate('/login');
      } else {
        const storedName = localStorage.getItem('userFullName');
        const storedRole = localStorage.getItem('userRole');

        setFullName(storedName || 'User');
        setRole(storedRole || 'member');

        console.log(`Dashboard loaded for ${storedName}, Role: ${storedRole}`);
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
      {/* Admin Role */}
      {role === 'admin' && (
        <div>
            <AdminHome fullName={fullName} onLogout={logout} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;