import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import InviteHeader from './InviteHeader';
import '../../index.css';

function UserInviteAccept() {
  const { invitationId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchInvitation = async () => {
    try {
      const q = query(collection(db, 'teamMembers'), where('invitationId', '==', invitationId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setUserData({ ...data, docId: snapshot.docs[0].id });
      } else {
        toast.error('Invalid or expired invitation.');
      }
    } catch (error) {
      console.error('Error fetching invitation:', error);
      toast.error('Something went wrong while fetching the invitation.');
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
      const inviteRef = doc(db, 'teamMembers', userData.docId);
      await updateDoc(inviteRef, {
        invitationAccepted: true,
        acceptedAt: new Date()
      });

      toast.success("Invitation accepted successfully! Welcome to the team!");
      setUserData(prev => ({ ...prev, invitationAccepted: true }));

      if (['manager', 'teamLead', 'employee'].includes(userData.memberRole)) {
        setShowPasswordForm(true);
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error("Failed to accept invitation. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      toast.error('Password cannot be empty');
      return;
    }

    setSavingPassword(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.emailAddress, password);
      const user = userCredential.user;

      // const targetCollection = userData.memberRole === 'manager' ? 'managers' : 'teamLeads';
      let targetCollection = '';
      if (userData.memberRole === 'manager') {
        targetCollection = 'managers';
      } else if (userData.memberRole === 'teamLead') {
        targetCollection = 'teamLeads';
      } else if (userData.memberRole === 'employee') {
        targetCollection = 'employees';
      }

      if (userData.memberRole === 'manager') {
        navigate('/manager-dashboard');
      } else if (userData.memberRole === 'teamLead') {
        navigate('/teamLead-dashboard');
      } else if (userData.memberRole === 'employee') {
        navigate('/employee-dashboard');
      }


      await setDoc(doc(db, targetCollection, user.uid), {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        email: user.email,
        teamName: userData.teamName || '',
        role: userData.memberRole,
        shortDescription: userData.shortDescription,
        createdAt: new Date()
      });

      toast.success('Account setup successfully!');

      // Redirect based on role
      if (userData.memberRole === 'manager') {
        navigate('/manager-dashboard');
      } else if (userData.memberRole === 'teamLead') {
        navigate('/teamLead-dashboard');
      }

    } catch (error) {
      console.error("Error creating account:", error);
      toast.error('Failed to create account: ' + error.message);
    } finally {
      setSavingPassword(false);
    }
  };


  useEffect(() => {
    fetchInvitation();
  }, [invitationId]);

  if (loading) return <p>Loading...</p>;

  return userData ? (
    <>
      <div className='container'>
        <InviteHeader />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <section style={{ marginTop: '100px' }}>
          <div className='box'>
            {userData.invitationAccepted ? (
              <>
                {['manager', 'teamLead', 'employee'].includes(userData.memberRole) && showPasswordForm && (
                  <>
                  <h1>Setup Your {userData.memberRole.charAt(0).toUpperCase() + userData.memberRole.slice(1)} Account</h1>
                  <form onSubmit={handlePasswordSubmit}>
                    <div className='parent-box'>
                      <label htmlFor="email">Email Address:</label>
                      <input 
                        type="email" 
                        value={userData.emailAddress} 
                        disabled 
                        className='input-box'
                      />
                    </div>
                    <div className='parent-box'>
                      <label htmlFor="password">Password:</label>
                      <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Set your password" 
                        className='input-box'
                      />
                    </div>
                    <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                      <button 
                        className="login-button" 
                        type="submit"
                        disabled={savingPassword}
                      >
                        {savingPassword ? 'Saving...' : 'Set Password'}
                      </button>
                    </div>
                  </form>
                  </>
                )}
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
