import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { auth, db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import "../../assets/styles/manager.css";

function TeamLeadProfile() {

  const [teamLeadData, setTeamLeadData] = useState(null);

  useEffect(() => {
    const fetchTeamLeadData = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const teamLeadQuery = query(
              collection(db, 'teamLeads'),
              where('email', '==', user.email)
            );
            const snapshot = await getDocs(teamLeadQuery);

            if (!snapshot.empty) {
              const teamLead = snapshot.docs[0].data();
              setTeamLeadData(teamLead);
            } else {
              console.log("Team Lead not found");
            }
          } catch(error) {
            console.error("Error fetching team lead data:", error);
          }
        }
      });
    };

    fetchTeamLeadData();
  }, []);

  return (
    <>
      <div className='users-container'>
        <h1 className='welcome-title'>Profile</h1>
          <div className='button-container'>
            <button className='admin-button'>Request Edit</button>
          </div>
      </div>
     {teamLeadData ? (
        <>
          <div className='info-card' style={{ color: 'white' }}>
            <p style={{ marginTop: '0px', marginBottom: '10px' }}><strong>Full Name:</strong> {teamLeadData.firstName} {teamLeadData.lastName}</p>
            <p style={{ marginTop: '0px', marginBottom: '10px' }}><strong>Email:</strong> {teamLeadData.email}</p>
            <p style={{ marginTop: '0px', marginBottom: '10px' }}><strong>Phone Number:</strong> {teamLeadData.phoneNumber}</p>
            <p style={{ marginTop: '0px', marginBottom: '10px' }}><strong>Role:</strong> {teamLeadData.role}</p>
            <p style={{ marginTop: '0px', marginBottom: '10px' }}><strong>Team Name:</strong> {teamLeadData.teamName}</p>
            <p style={{ marginTop: '0px', marginBottom: '10px' }}><strong>Description:</strong> {teamLeadData.shortDescription}</p>
          </div>

        </>
      ) : (
        <p style={{ color: 'white' }}>Loading team lead details...</p>
      )}
    </>
  )
}

export default TeamLeadProfile
