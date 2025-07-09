import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { auth, db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

function ManagerDashboard() {

  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
  const fetchTeamUserCount = async () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Step 1: Get manager's team
          const managerQuery = query(
            collection(db, 'managers'),
            where('email', '==', user.email)
          );
          const managerSnapshot = await getDocs(managerQuery);

          if (!managerSnapshot.empty) {
            const managerData = managerSnapshot.docs[0].data();
            const teamName = managerData.teamName;

            // Step 2: Get users in that team
            const teamMembersQuery = query(
              collection(db, 'teamMembers'),
              where('teamName', '==', teamName),
              where('invitationAccepted', '==', true)
            );
            const teamMembersSnapshot = await getDocs(teamMembersQuery);

            // Step 3: Set count
            setUserCount(teamMembersSnapshot.size);
          }
        } catch (error) {
          console.error("Error fetching team members count:", error);
        }
      }
    });
  };

  fetchTeamUserCount();
}, []);

  return (
    <>
      <div>
        <div className='card-grid'>
          <div className="info-card" style={{ color: 'white' }}>
            <h2 style={{marginBottom: '0px', marginTop: '0px'}}>Users In Your Team</h2>
            <p style={{marginTop: '4px', marginBottom: '0px', fontSize: '30px', fontWeight: '600'}}>{userCount}</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default ManagerDashboard
