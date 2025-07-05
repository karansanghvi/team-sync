import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import '../../assets/styles/admin.css';
import { addDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { v4 as uuidv4 } from 'uuid';
import successAnimation from '../../assets/animations/success.json'; 
import { FaRegCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';

function Users() {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [activeSection, setActiveSection] = useState('personalInformation');
  const [teams, setTeams] = useState([]);
  const [selected, setSelected] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [invitationLink, setInvitationLink] = useState('');
  const [showUserAddedModal, setShowUserAddedModal] = useState(false);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    phoneNumber: '',
    shortDescription: '',
    memberRole: ''
  });

  const handleAddUserClick = () => setIsAddingUser(true);

  const memberRoles = [
    { label: "Manager", value: "manager" },
    { label: "Team Lead", value: "teamLead" },
    { label: "Intern", value: "intern" },
    { label: "Viewer", value: "viewer" }
  ];

  const handleUserInputChange = (e) => {
    const { id, value } = e.target;
    setUserFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const fetchTeams = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'teams'));
      const teamData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeams(teamData);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  // Updated to use real-time listener for pending invites instead of members
  const fetchPendingInvites = () => {
    const unsubscribe = onSnapshot(collection(db, 'pendingInvitations'), (snapshot) => {
      const inviteData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPendingInvites(inviteData);
    });

    return () => unsubscribe();
  };

  useEffect(() => {
    if (isAddingUser) {
      fetchTeams();
    }
  }, [isAddingUser]);

  useEffect(() => {
    fetchPendingInvites();
  }, []);

  // GO TO NEXT SCREEN
  const handleNextFromPersonalInfo = (e) => {
    e.preventDefault();
    setActiveSection('team');
  };

  const handleNextFromTeam = (e) => {
    e.preventDefault();
    if (!selectedTeam) {
      toast.succes("Please select a team before proceeding.");
      return;
    }
    setActiveSection('invitation');
  };

  // SUBMIT INVITATION
  const handleSubmitInvitation = async (e) => {
    e.preventDefault();
    try {
      const id = uuidv4();
      const inviteData = {
        ...userFormData,
        teamName: selectedTeam,
        createdAt: new Date(),
        invitationAccepted: false
      };

      await addDoc(collection(db, 'pendingInvitations'), {
        invitationId: id,
        ...inviteData
      });

      const link = `http://localhost:5173/invite/${id}`; // Replace with deployed domain later
      setInvitationLink(link);
      alert("Invitation link generated!");
    } catch (error) {
      console.error("Error creating invitation:", error);
    }
  };

  return (
    <>
      {!isAddingUser ? (
        <>
          <div className='users-container'>
            <h1 className='welcome-title'>Users</h1>
            <div className='button-container'>
              <button className='admin-button' onClick={handleAddUserClick}>Add Users</button>
            </div>
          </div>

          <div className='user-list'>
            {pendingInvites.length === 0 ? (
              <p>No users added yet.</p>
            ) : (
              <table className='user-table'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th>Role</th>
                    <th>Team</th>
                    <th>Description</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInvites.map((user) => (
                    <tr key={user.id}>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.emailAddress}</td>
                      <td>{user.phoneNumber}</td>
                      <td>{user.memberRole}</td>
                      <td>{user.teamName}</td>
                      <td>{user.shortDescription}</td>
                      <td>
                        {user.invitationAccepted ? (
                          <span style={{ 'color': 'green' }}>Accepted</span>
                        ) : (
                          <>
                          <span style={{ 'color': 'red' }}>Pending</span>
                          <FaRegCopy
                            style={{ cursor: 'pointer', marginLeft: '8px' }}
                            title='Copy Invitation Link'
                            onClick={() => {
                              const link = `http://localhost:5173/invite/${user.invitationId}`;
                              navigator.clipboard.writeText(link);
                              alert("Invitation link copied!");
                            }}
                          />
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <div className='add-users-container'>
          <h1 className='welcome-title'>Add Users</h1>
          <div className='user-grid-container'>
            {/* Left nav */}
            <div className='add-users-nav'>
              <h2 className={activeSection === 'personalInformation' ? 'active-nav' : ''} onClick={() => setActiveSection('personalInformation')}>Personal Information</h2>
              <h2 className={activeSection === 'team' ? 'active-nav' : ''} onClick={() => setActiveSection('team')}>Team & Role</h2>
              <h2 className={activeSection === 'invitation' ? 'active-nav' : ''} onClick={() => setActiveSection('invitation')}>Invitation</h2>
            </div>

            <div className="vertical-divider"></div>

            {/* Right form content */}
            <div className='add-users-form'>
              {/* PERSONAL INFORMATION */}
              {activeSection === 'personalInformation' && (
                <form onSubmit={handleNextFromPersonalInfo}>
                  <h2 style={{ marginBottom: '0px' }}>Personal Information</h2>
                  <p style={{ marginTop: '0px' }}>Enter the user's personal information.</p>

                  <div className='name-grid'>
                    <div>
                      <label htmlFor='firstName'>First Name:</label>
                      <input type="text" id="firstName" value={userFormData.firstName} onChange={handleUserInputChange} className='input-box' placeholder='John' required />
                    </div>
                    <div>
                      <label htmlFor='lastName'>Last Name:</label>
                      <input type="text" id="lastName" value={userFormData.lastName} onChange={handleUserInputChange} className='input-box' placeholder='Doe' required />
                    </div>
                  </div>

                  <br />

                  <div className='name-grid'>
                    <div>
                      <label htmlFor='emailAddress'>Email Address:</label>
                      <input type="email" id="emailAddress" value={userFormData.emailAddress} onChange={handleUserInputChange} className='input-box' placeholder='john.doe@gmail.com' required />
                    </div>
                    <div>
                      <label htmlFor='phoneNumber'>Phone Number:</label>
                      <input type="text" id="phoneNumber" value={userFormData.phoneNumber} onChange={handleUserInputChange} className='input-box' placeholder='+91-1234567890' required />
                    </div>
                  </div>

                  <div className='parent-box'>
                    <label htmlFor='shortDescription'>Short Description:</label>
                    <textarea id="shortDescription" value={userFormData.shortDescription} onChange={handleUserInputChange} className='description-box' placeholder='Type a description about the user...' />
                  </div>

                  <div className='personal-info-button'>
                    <button type='submit' className='admin-button'>Next</button>
                  </div>
                </form>
              )}

              {/* TEAM */}
              {activeSection === 'team' && (
                <form onSubmit={handleNextFromTeam}>
                  <h2 style={{ marginBottom: '0px' }}>Team & Role</h2>
                  <p style={{ marginTop: '0px' }}>Assign the user to a role and team.</p>

                  <label htmlFor='memberRole'>Select the role:</label>
                    <div className="team-limit-radio-group">
                      {memberRoles.map((option, index) => (
                        <label
                          key={index}
                          className={`radio-box ${selected === option.value ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name="memberRole"
                            value={option.value}
                            className="radio-input"
                            onChange={() => {
                              setSelected(option.value);
                              setUserFormData((prev) => ({ ...prev, memberRole: option.value }));
                            }}
                            checked={selected === option.value}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>

                    <br/>

                  {teams.length === 0 ? (
                    <p className='not-available'>No teams available</p>
                  ) : (
                    <>
                    <label htmlFor='userTeam'>Select a team:</label>
                      <div className='team-limit-radio-group'>
                        {teams.map((team) => (
                          <label key={team.id} className={`radio-box ${selectedTeam === team.teamName ? 'selected' : ''}`}>
                            <input
                              type="radio"
                              name="userTeam"
                              value={team.teamName}
                              className="radio-input"
                              onChange={() => setSelectedTeam(team.teamName)}
                              checked={selectedTeam === team.teamName}
                            />
                            {team.teamName}
                          </label>
                        ))}
                      </div>
                    </>
                  )}

                  <div className='team-info-button-two'>
                    <button type='button' className='admin-button' onClick={() => setActiveSection('personalInformation')}>Back</button>
                    <button type='submit' className='admin-button'>Next</button>
                  </div>
                </form>
              )}

              {/* INVITATION */}
              {activeSection === 'invitation' && (
                <form onSubmit={handleSubmitInvitation}>
                  <h2 style={{ marginBottom: '0px' }}>Invitation</h2>
                  <p style={{ marginTop: '0px' }}>Send an invitation to the user to join the team.</p>

                  <div>
                    <label htmlFor="invitationLink">Invitation Link:</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        id="invitationLink"
                        value={invitationLink}
                        className="input-box"
                        placeholder="Generated link will appear here..."
                        readOnly
                        style={{ flex: 1 }}
                      />

                      {!invitationLink && (
                        <button type="submit" className="generate-button">Generate</button>
                      )}

                      {invitationLink && (
                        <button
                          type="button"
                          className="generate-button"
                          onClick={() => {
                            navigator.clipboard.writeText(invitationLink);
                            alert("Invitation link copied to clipboard!");
                          }}
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  </div>

                  <div className='team-info-button-two'>
                    <button type='button' className='admin-button' onClick={() => setActiveSection('team')}>Back</button>
                    <button
                      type='button'
                      className='admin-button'
                      onClick={() => {
                        setShowUserAddedModal(true);
                        setIsAddingUser(false);
                        setUserFormData({
                          firstName: '',
                          lastName: '',
                          emailAddress: '',
                          phoneNumber: '',
                          shortDescription: '',
                          memberRole: '',
                        });
                        setSelectedTeam('');
                        setInvitationLink('');
                        setActiveSection('personalInformation');
                      }}
                    >
                      Submit
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* USER ADDED MODAL */}
      {showUserAddedModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <Lottie 
              animationData={successAnimation} 
              loop={false} 
              autoplay 
              style={{ height: 150, width: 150, margin: '0 auto' }}
            />
            <h2 style={{ marginBottom: '0px' }}>Success!</h2>
            <p style={{ marginTop: '0px' }}>
              The user invitation has been successfully created.
            </p>
            <button
              className='admin-button'
              onClick={() => {
                setShowUserAddedModal(false);
                setIsAddingUser(false);
                setUserFormData({
                  firstName: '',
                  lastName: '',
                  emailAddress: '',
                  phoneNumber: '',
                  shortDescription: '',
                  memberRole: '',
                });
                setSelectedTeam('');
                setInvitationLink('');
                setSelected('');
                setActiveSection('personalInformation');
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </>
  );
}

export default Users;