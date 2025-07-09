import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { auth, db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import "../../assets/styles/manager.css";

function EmployeeProfile() {

  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const employeeQuery = query(
              collection(db, 'employees'),
              where('email', '==', user.email)
            );
            const snapshot = await getDocs(employeeQuery);

            if (!snapshot.empty) {
              const employee = snapshot.docs[0].data();
              setEmployeeData(employee);
            } else {
              console.log("Employee not found");
            }
          } catch(error) {
            console.error("Error fetching employee data:", error);
          }
        }
      });
    };

    fetchEmployeeData();
  }, []);

  return (
    <>
      <div className='users-container'>
        <h1 className='welcome-title'>Profile</h1>
          <div className='button-container'>
            <button className='admin-button'>Request Edit</button>
          </div>
      </div>
     {employeeData ? (
        <>
          <div className='info-card' style={{ color: 'white' }}>
            <p style={{ marginTop: '0px', marginBottom: '10px' }}><strong>Full Name:</strong> {employeeData.firstName} {employeeData.lastName}</p>
            <p style={{ marginTop: '0px', marginBottom: '10px' }}><strong>Email:</strong> {employeeData.email}</p>
            <p style={{ marginTop: '0px', marginBottom: '10px' }}><strong>Phone Number:</strong> {employeeData.phoneNumber}</p>
            <p style={{ marginTop: '0px', marginBottom: '10px' }}><strong>Role:</strong> {employeeData.role}</p>
            <p style={{ marginTop: '0px', marginBottom: '10px' }}><strong>Team Name:</strong> {employeeData.teamName}</p>
            <p style={{ marginTop: '0px', marginBottom: '10px' }}><strong>Description:</strong> {employeeData.shortDescription}</p>
          </div>

        </>
      ) : (
        <p style={{ color: 'white' }}>Loading team lead details...</p>
      )}
    </>
  )
}

export default EmployeeProfile
