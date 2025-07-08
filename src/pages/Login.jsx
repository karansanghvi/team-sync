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
  //   if (!emailAddress || !password) {
  //     toast.error('Please enter email and password');
  //     return;
  //   }

  //   try {
  //     // Step 1: Check in `managers` collection
  //     const q = query(
  //       collection(db, 'managers'),
  //       where('email', '==', emailAddress),
  //       where('password', '==', password) // NOTE: This is plain text (should be hashed in real apps)
  //     );

  //     const snapshot = await getDocs(q);

  //     if (!snapshot.empty) {
  //       const managerData = snapshot.docs[0].data();
  //       localStorage.setItem('userFullName', managerData.name || 'Manager');
  //       localStorage.setItem('userRole', 'manager');
  //       localStorage.setItem('userEmail', managerData.email);
  //       toast.success('Logged in as Manager');
  //       navigate('/manager-dashboard');
  //       return;
  //     }

  //     // Step 2: If not a manager, try Firebase Auth for admin login
  //     const { user } = await signInWithEmailAndPassword(auth, emailAddress, password);
  //     console.log("User logged in with Firebase Auth:", user.email);

  //     const userDoc = await getDoc(doc(db, 'users', user.uid));
  //     if (!userDoc.exists()) {
  //       toast.error('Admin profile not found.');
  //       return;
  //     }

  //     const userData = userDoc.data();
  //     const fullName = userData.fullName || 'Admin';
  //     const role = userData.role || 'admin';

  //     localStorage.setItem('userFullName', fullName);
  //     localStorage.setItem('userRole', role);
  //     localStorage.setItem('userUID', user.uid);

  //     toast.success('Logged in as Admin');
  //     navigate('/dashboard');
  //   } catch (error) {
  //     toast.error('Login failed: ' + error.message);
  //     console.error("Login failed:", error.message);
  //   }
  // };

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

    // Step 2: Check in users collection (admin)
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
