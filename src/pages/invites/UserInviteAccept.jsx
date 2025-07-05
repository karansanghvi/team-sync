import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

function UserInviteAccept() {
  const { invitationId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  const fetchInvitation = async () => {
    try {
      const q = query(collection(db, 'pendingInvitations'), where('invitationId', '==', invitationId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setUserData({ ...data, docId: snapshot.docs[0].id });
      } else {
        toast.sucess('Invalid or expired invitation.');
      }
    } catch (error) {
      console.error('Error fetching invitation:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!userData || !userData.docId) {
      toast.error('Invalid invitation data.');
      return;
    }

    setAccepting(true);
    try {
      // Use the Firestore document ID, not the custom invitationId
      const inviteRef = doc(db, 'pendingInvitations', userData.docId);
      await updateDoc(inviteRef, {
        invitationAccepted: true,
        acceptedAt: new Date()
      });
      console.log("Invitation accepted successfully!");
      toast.success("Invitation accepted successfully! Welcome to the team!");
      
      // Update local state to reflect the change
      setUserData(prev => ({ ...prev, invitationAccepted: true }));
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error("Failed to accept invitation. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

  useEffect(() => {
    fetchInvitation();
  }, [invitationId]);

  if (loading) return <p>Loading...</p>;

  return userData ? (
    <>
      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '60px', fontWeight: 600, color: 'white' }}>TeamSync</div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <section className='container'>
          <div className='box'>
            {userData.invitationAccepted ? (
              <>
                <h1 style={{ textAlign: 'center' }}>Welcome to the team, {userData.firstName}! 🎉</h1>
                <p style={{ textAlign: 'center' }}>
                  Your invitation has been accepted successfully. You're now part of the <strong>{userData.teamName}</strong> team as a <strong>{userData.memberRole}</strong>.
                </p>
              </>
            ) : (
              <>
                <h1 style={{ textAlign: 'center' }}>Hey, {userData.firstName}! 👋</h1>
                <p style={{ textAlign: 'center' }}>
                  You're invited to TeamSync as a <strong>{userData.memberRole}</strong> in the <strong>{userData.teamName}</strong> team.
                  Kindly click the below button to accept the invite.
                </p>
                <div className='parent-box-two'>
                  <button 
                    className="login-button" 
                    onClick={acceptInvitation}
                    disabled={accepting}
                  >
                    {accepting ? 'Accepting...' : 'Accept Invite'}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  ) : (
    <p>Invitation not found.</p>
  );
}

export default UserInviteAccept;