import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

function Signup() {
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!fullName || !emailAddress || !password) {
        toast.error('Please fill all fields');
        return;
    }

    try {
        const { user } = await createUserWithEmailAndPassword(auth, emailAddress, password);
        console.log("User created:", user.email);

        await setDoc(doc(db, 'users', user.uid), {
            fullName,
            email: emailAddress,
            role: 'admin'
        });

        console.log("Admin role assigned to:", user.email);
        toast.success('Account created successfully with admin role!');
        navigate('/login');
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
        toast.error('Account already exists. Please login.');
        } else {
        toast.error('Error: ' + error.message);
        }
        console.log('Error:', error.message);
    }
  };

  return (
    <section className='container'>
      <h1 className='title'>Create An Account</h1>
      <div className='box'>
        <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
            <div className='parent-box'>
                <label htmlFor="fullName">Enter Full Name:</label>
                <input type="text" id='fullName' className='input-box' value={fullName} onChange={e => setFullName(e.target.value)} placeholder='John Doe' required />
            </div>
            <div className='parent-box'>
                <label htmlFor="emailAddress">Email Address:</label>
                <input type="email" id='emailAddress' className='input-box' value={emailAddress} onChange={e => setEmailAddress(e.target.value)} placeholder='johndoe@gmail.com' required />
            </div>
            <div className='parent-box'>
                <label htmlFor="password">Password:</label>
                <input type="password" id='password' className='input-box' value={password} onChange={e => setPassword(e.target.value)} placeholder='Password' required />
            </div>
            <div className='goToSignup'>
                <p>Already have an account? <Link to="/login" className='link'>Login</Link></p>
            </div>
            <div className='parent-box-two'>
                <button className="login-button">Signup</button>
            </div>
        </form>
      </div>
    </section>
  );
}

export default Signup;
