import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

function AdminProfile() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const uid = localStorage.getItem('userUID');
      if (!uid) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  if (!userData) {
    return <h1 className='welcome-title'>Loading Profile...</h1>;
  }

  return (
    <div>
      <h1 className='welcome-title'>Profile</h1>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className='box'>
          <p><strong>Full Name:</strong> {userData.fullName}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Role:</strong> {userData.role}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
