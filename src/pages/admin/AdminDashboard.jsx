import React, { useEffect, useState } from 'react';
import "../../assets/styles/admin.css";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

function AdminDashboard() {

  const [numberTeams, setNumberTeams] = useState(0);
  const [numberAcceptedUsers, setNumberAcceptedUsers] = useState(0);
  const [numberPendingInvites, setNumberPendingInvites] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const teamsSnapshot = await getDocs(collection(db, 'teams'));
            setNumberTeams(teamsSnapshot.size);

            const membersSnapshot = await getDocs(collection(db, 'teamMembers'));
            let accepted = 0;
            let pending = 0;
            
            membersSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.invitationAccepted) {
                    accepted += 1;
                } else {
                    pending += 1;
                }
            });
            
            setNumberAcceptedUsers(accepted);
            setNumberPendingInvites(pending);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    };

    fetchData();
  }, []);

  return (
    <>
     <div>
        <div className="card-grid">
            <div className="info-card" style={{ color: 'white' }}>
              <h2 style={{marginBottom: '0px', marginTop: '0px'}}>Number Of Teams</h2>
              <p style={{marginTop: '4px', marginBottom: '0px', fontSize: '30px', fontWeight: '600'}}>{numberTeams}</p>
            </div>

            <div className="info-card" style={{ color: 'white' }}>
              <h2 style={{marginBottom: '0px' , marginTop: '0px'}}>Number Of Users</h2>
              <p style={{marginTop: '4px', marginBottom: '0px', fontSize: '30px', fontWeight: '600'}}>{numberAcceptedUsers}</p>
            </div>

            <div className="info-card" style={{ color: 'white' }}>
              <h2 style={{marginBottom: '0px' , marginTop: '0px'}}>Users With Pending Invites</h2>
              <p style={{marginTop: '4px', marginBottom: '0px', fontSize: '30px', fontWeight: '600'}}>{numberPendingInvites}</p>
            </div>
        </div>
     </div> 
    </>
  )
}

export default AdminDashboard
