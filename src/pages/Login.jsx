import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

function Login() {
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!emailAddress || !password) {
      toast.error('Please enter email and password');
      return;
    }

    try {
      const { user } = await signInWithEmailAndPassword(auth, emailAddress, password);

      // Step 1: Check in managers collection
      const managerDoc = await getDoc(doc(db, 'managers', user.uid));
      if (managerDoc.exists()) {
        const managerData = managerDoc.data();
        localStorage.setItem('userFullName', managerData.fullName || 'Manager');
        localStorage.setItem('userRole', 'manager');
        localStorage.setItem('userUID', user.uid);
        toast.success('Logged in as Manager');
        navigate('/manager-dashboard');
        return;
      }

      // Step 2: Check in teamLeads collection
      const teamLeadDoc = await getDoc(doc(db, 'teamLeads', user.uid));
      if (teamLeadDoc.exists()) {
        const leadData = teamLeadDoc.data();
        localStorage.setItem('userFullName', leadData.fullName || 'Team Lead');
        localStorage.setItem('userRole', 'teamLead');
        localStorage.setItem('userUID', user.uid);
        toast.success('Logged in as Team Lead');
        navigate('/teamLead-dashboard');
        return;
      }

      // Step 3: Check in employees collection
      const employeeDoc = await getDoc(doc(db, 'employees', user.uid));
      if (employeeDoc.exists()) {
        const employeeData = employeeDoc.data();
        localStorage.setItem('userFullName', employeeData.fullName || 'Employee');
        localStorage.setItem('userRole', 'employee');
        localStorage.setItem('userUID', user.uid);
        toast.success('Logged in as Employee');
        navigate('/employee-dashboard');
        return;
      }

      // Step 4: Check in users collection (admin)
      const adminDoc = await getDoc(doc(db, 'users', user.uid));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        localStorage.setItem('userFullName', adminData.fullName || 'Admin');
        localStorage.setItem('userRole', adminData.role || 'admin');
        localStorage.setItem('userUID', user.uid);
        toast.success('Logged in as Admin');
        navigate('/dashboard');
        return;
      }

      toast.error('User profile not found.');
    } catch (error) {
      console.error("Login failed:", error.message);
      toast.error('Login failed: ' + error.message);
    }
  };

  return (
    <section className='main-container'>
      <h1 className='title'>Welcome Back</h1>
      <div className='box'>
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <div className='parent-box'>
            <label htmlFor="emailAddress">Email Address:</label>
            <input
              type="email"
              id='emailAddress'
              className='input-box'
              value={emailAddress}
              onChange={e => setEmailAddress(e.target.value)}
              placeholder='johndoe@gmail.com'
              required
            />
          </div>
          <div className='parent-box'>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id='password'
              className='input-box'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='Password'
              required
            />
          </div>
          <div className='goToSignup'>
            <p>Don't have an account? <Link to="/signup" className='link'>Signup</Link></p>
          </div>
          <div className='parent-box-two'>
            <button className="login-button">Login</button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Login;
