import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';

function UserInviteAccept() {
  const { invitationId } = useParams();
  const [userData, setUserData] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInvitation = async () => {
    try {
      const q = query(collection(db, 'pendingInvitations'), where('invitationId', '==', invitationId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setUserData({ ...data });
        const teamQ = query(collection(db, 'teams'), where('teamName', '==', data.teamName));
        const teamSnap = await getDocs(teamQ);
        if (!teamSnap.empty) {
          setTeamData(teamSnap.docs[0].data());
        }
      } else {
        alert('Invalid or expired invitation.');
      }
    } catch (error) {
      console.error('Error fetching invitation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    try {
      await addDoc(collection(db, 'teamMembers'), userData);
      const q = query(collection(db, 'pendingInvitations'), where('invitationId', '==', invitationId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        await deleteDoc(doc(db, 'pendingInvitations', snapshot.docs[0].id));
      }
      alert('Invitation accepted. User added successfully!');
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  useEffect(() => {
    fetchInvitation();
  }, []);

  if (loading) return <p>Loading...</p>;

  return userData ? (
    <div className="invite-page">
      <h1>You're invited, {userData.firstName}!</h1>
      <p><strong>Email:</strong> {userData.emailAddress}</p>
      <p><strong>Description:</strong> {userData.shortDescription}</p>
      <h2>Team: {teamData?.teamName}</h2>
      <p><strong>Team Description:</strong> {teamData?.teamDescription}</p>
      <button className='admin-button' onClick={handleAcceptInvite}>Accept Invite</button>
    </div>
  ) : (
    <p>Invitation not found.</p>
  );
}

export default UserInviteAccept;
