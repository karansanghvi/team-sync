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
        console.log("User logged in:", user.email);

        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (!userDoc.exists()) {
        toast.error('User profile not found.');
        return;
        }

        const userData = userDoc.data();
        const fullName = userData.fullName;
        const role = userData.role;

        localStorage.setItem('userFullName', fullName);
        localStorage.setItem('userRole', role);

        console.log(`User: ${fullName}, Role: ${role}`);
        navigate('/dashboard');
    } catch (error) {
        toast.error('Login failed: ' + error.message);
        console.log("Login failed: " + error.message);
    }
  };

  return (
    <section className='container'>
      <h1 className='title'>Welcome Back</h1>
      <div className='box'>
       <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
         <div className='parent-box'>
          <label htmlFor="emailAddress">Email Address:</label>
          <input type="email" id='emailAddress' className='input-box' value={emailAddress} onChange={e => setEmailAddress(e.target.value)} placeholder='johndoe@gmail.com' />
        </div>
        <div className='parent-box'>
          <label htmlFor="password">Password:</label>
          <input type="password" id='password' className='input-box' value={password} onChange={e => setPassword(e.target.value)} placeholder='Password' />
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
