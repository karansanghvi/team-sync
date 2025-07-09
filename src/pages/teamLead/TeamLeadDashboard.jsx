import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

function TeamLeadDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    const fetchTeamStats = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            // Step 1: Get teamLead's team name
            const teamLeadQuery = query(
              collection(db, 'teamLeads'),
              where('email', '==', user.email)
            );
            const teamLeadSnapshot = await getDocs(teamLeadQuery);

            if (!teamLeadSnapshot.empty) {
              const teamLeadData = teamLeadSnapshot.docs[0].data();
              const teamName = teamLeadData.teamName;

              // Step 2: Get all accepted users in the team
              const membersQuery = query(
                collection(db, 'teamMembers'),
                where('teamName', '==', teamName),
                where('invitationAccepted', '==', true)
              );
              const membersSnapshot = await getDocs(membersQuery);

              const teamEmails = membersSnapshot.docs.map(doc => doc.data().emailAddress);
              setUserCount(teamEmails.length);

              if (teamEmails.length > 0) {
                // Step 3: Get all tasks
                const allTasksSnapshot = await getDocs(collection(db, 'tasks'));
                const teamTasks = allTasksSnapshot.docs.filter(doc =>
                  teamEmails.includes(doc.data().assignedTo)
                );

                // Step 4: Set task count
                setTaskCount(teamTasks.length);
              } else {
                setTaskCount(0);
              }
            }
          } catch (error) {
            console.error("Error fetching team data:", error);
          }
        }
      });
    };

    fetchTeamStats();
  }, []);

  return (
    <>
      <div>
        <div className='card-grid'>
          <div className="info-card" style={{ color: 'white' }}>
            <h2 style={{ marginBottom: '0px', marginTop: '0px' }}>Users In Your Team</h2>
            <p style={{ marginTop: '4px', marginBottom: '0px', fontSize: '30px', fontWeight: '600' }}>{userCount}</p>
          </div>
          <div className="info-card" style={{ color: 'white' }}>
            <h2 style={{ marginBottom: '0px', marginTop: '0px' }}>Tasks Assigned</h2>
            <p style={{ marginTop: '4px', marginBottom: '0px', fontSize: '30px', fontWeight: '600' }}>{taskCount}</p>
          </div>
          <div className="info-card" style={{ color: 'white' }}>
            <h2 style={{ marginBottom: '0px', marginTop: '0px' }}>Tasks Completed</h2>
            <p style={{ marginTop: '4px', marginBottom: '0px', fontSize: '30px', fontWeight: '600' }}></p>
          </div>
        </div>
      </div>
    </>
  );
}

export default TeamLeadDashboard;
