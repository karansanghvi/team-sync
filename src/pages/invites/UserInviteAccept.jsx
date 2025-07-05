import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import InviteHeader from './InviteHeader';

function UserInviteAccept() {
  const { invitationId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInvitation = async () => {
    try {
      const q = query(collection(db, 'pendingInvitations'), where('invitationId', '==', invitationId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setUserData({ ...data, docId: snapshot.docs[0].id });
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
      const newUser = {
        ...userData,
        invitationAccepted: true,
        createdAt: Timestamp.now()
      };
      delete newUser.docId; // Remove Firestore docId before storing

      await addDoc(collection(db, 'teamMembers'), newUser);

      if (userData?.docId) {
        await deleteDoc(doc(db, 'pendingInvitations', userData.docId));
      }

      alert('Invitation accepted! You have been successfully added to the team.');
      window.location.href = '/'; // Optional: redirect to home or dashboard
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('Failed to accept the invitation. Please try again.');
    }
  };

  useEffect(() => {
    fetchInvitation();
  }, []);

  if (loading) return <p>Loading...</p>;

  return userData ? (
    <>
      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '60px', fontWeight: 600, color: 'white' }}>TeamSync</div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <section className='container'>
          <div className='box'>
            <h1 style={{ textAlign: 'center' }}>Hey, {userData.firstName}! 👋</h1>
            <p style={{ textAlign: 'center' }}>
              You're invited to TeamSync as a <strong>{userData.memberRole}</strong>.
              Kindly click the below button to accept the invite.
            </p>
            <div className='parent-box-two'>
              <button className="login-button" onClick={handleAcceptInvite}>Accept Invite</button>
            </div>
          </div>
        </section>
      </div>
    </>
  ) : (
    <p>Invitation not found.</p>
  );
}

export default UserInviteAccept;
