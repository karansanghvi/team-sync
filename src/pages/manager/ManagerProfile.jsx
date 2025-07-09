import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { auth, db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import "../../assets/styles/manager.css";

function ManagerProfile() {

  const [managerData, setManagerData] = useState(null);

  useEffect(() => {
    const fetchManagerData = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const managerQuery = query(
              collection(db, 'managers'),
              where('email', '==', user.email)
            );
            const snapshot = await getDocs(managerQuery);

            if (!snapshot.empty) {
              const manager = snapshot.docs[0].data();
              setManagerData(manager);
            } else {
              console.log("Manager not found");
            }
          } catch(error) {
            console.error("Error fetching manager data:", error);
          }
        }
      });
    };

    fetchManagerData();
  }, []);

  return (
    <>
      <div className='users-container'>
        <h1 className='welcome-title'>Profile</h1>
          <div className='button-container'>
            <button className='admin-button'>Request Edit</button>
          </div>
      </div>
     {managerData ? (
        <>
          <div className='info-card' style={{ color: 'white' }}>
            <p style={{ marginTop: '0px', marginBottom: '10px' }}><strong>Full Name:</strong> {managerData.firstName} {managerData.lastName}</p>
            <p style={{ marginTop: '0px', marginBottom: '10px' }}><strong>Email:</strong> {managerData.email}</p>
            <p style={{ marginTop: '0px', marginBottom: '10px' }}><strong>Phone Number:</strong> {managerData.phoneNumber}</p>
            <p style={{ marginTop: '0px', marginBottom: '10px' }}><strong>Role:</strong> {managerData.role}</p>
            <p style={{ marginTop: '0px', marginBottom: '10px' }}><strong>Team Name:</strong> {managerData.teamName}</p>
            <p style={{ marginTop: '0px', marginBottom: '10px' }}><strong>Description:</strong> {managerData.shortDescription}</p>
          </div>

          {/* <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }} className='blue-box'>
            <h2 style={{ color: 'white' }}>Contact Admin To Edit Profile Details</h2>
          </div> */}
        </>
      ) : (
        <p style={{ color: 'white' }}>Loading manager details...</p>
      )}
    </>
  )
}

export default ManagerProfile
