import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import successAnimation from '../../assets/animations/success.json';
import deleteAnimation from '../../assets/animations/delete.json';
import { IoArrowBackCircleSharp } from 'react-icons/io5';
import { FaEdit, FaRegCopy } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';

function ManagerUsers() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [managerTeams, setManagerTeams] = useState([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [activeSection, setActiveSection] = useState('personalInformation');
  const [teams, setTeams] = useState([]);
  const [selected, setSelected] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [invitationLink, setInvitationLink] = useState('');
  const [showUserAddedModal, setShowUserAddedModal] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [successActionType, setSuccessActionType] = useState('');
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    phoneNumber: '',
    shortDescription: '',
    memberRole: ''
  });

  const fetchTeamMembers = async (teamsList) => {
    try {
      const membersQuery = query(collection(db, 'teamMembers'), where('teamName', 'in', teamsList));
      const membersSnapshot = await getDocs(membersQuery);
      const members = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeamMembers(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const managerQuery = query(collection(db, 'managers'), where('email', '==', user.email));
        const managerSnapshot = await getDocs(managerQuery);
        const teams = managerSnapshot.docs.map(doc => doc.data().teamName);
        setManagerTeams(teams);

        if (teams.length > 0) {
          const membersQuery = query(collection(db, 'teamMembers'), where('teamName', 'in', teams));
          const unsubscribeSnapshot = onSnapshot(membersQuery, (snapshot) => {
            const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTeamMembers(members);
          });

          return () => unsubscribeSnapshot();
        }
      }
    });

  return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (showUserAddedModal) {
      const timer = setTimeout(() => {
        setShowUserAddedModal(false);
        setIsAddingUser(false);
        setIsEditingUser(false);
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
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showUserAddedModal]);

  const handleAddUserClick = () => {
    setIsEditingUser(false);
    setIsAddingUser(true);
    setUserFormData({
        firstName: '',
        lastName: '',
        emailAddress: '',
        phoneNumber: '',
        shortDescription: '',
        memberRole: ''
    });
    setSelected('');
    setSelectedTeam('');
    setInvitationLink('');
    setActiveSection('personalInformation');

    setTimeout(fetchTeams, 100); 
  };

  const fetchTeams = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'teams'));
        const teamList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const filtered = teamList.filter(team => managerTeams.includes(team.teamName));
        setTeams(filtered);
    } catch (error) {
        console.error("Error fetching teams:", error);
    }
  };

  const handleUserInputChange = (e) => {
    const { id, value } = e.target;
    setUserFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleNextFromPersonalInfo = (e) => {
    e.preventDefault();
    setActiveSection('team');
  };

  const handleNextFromTeam = (e) => {
    e.preventDefault();
    if (!selectedTeam) {
      toast.error("Please select a team.");
      return;
    }
    setActiveSection('invitation');
  };

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
      await addDoc(collection(db, 'teamMembers'), { invitationId: id, ...inviteData });
      setInvitationLink(`http://localhost:5173/invite/${id}`);
      setShowUserAddedModal(true);
      setSuccessActionType('invite');
    } catch (err) {
      console.error("Error creating invite:", err);
    }
  };

  const handleGoToUserPageFromAddUser = () => {
    setIsAddingUser(false);
    setIsEditingUser(false);
    setUserFormData({
      firstName: '',
      lastName: '',
      emailAddress: '',
      phoneNumber: '',
      shortDescription: '',
      memberRole: ''
    });
    setSelected('');
    setSelectedTeam('');
    setInvitationLink('');
    setActiveSection('personalInformation');
  };

  const memberRoles = [
    { label: "Manager", value: "manager" },
    { label: "Team Lead", value: "teamLead" },
    { label: "Intern", value: "intern" },
    { label: "Viewer", value: "viewer" }
  ];

  const handleSaveEditedUser = async (e) => {
    e.preventDefault();
    if (!editingUserId) return;

    try {
      const userRef = doc(db, 'teamMembers', editingUserId); 
      await updateDoc(userRef, {
        ...userFormData,
        teamName: selectedTeam,
        updatedAt: new Date()
      });

      toast.success('User updated successfully!');
      setShowUserAddedModal(true);
      setSuccessActionType('edit');
      setIsAddingUser(false);
      setIsEditingUser(false);
      fetchTeamMembers(managerTeams); 
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error('Failed to update user.');
    }
  };


  return (
    <>
      {isAddingUser ? (
        <>
            <div className='add-users-container'>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <IoArrowBackCircleSharp size={28} color='white' onClick={handleGoToUserPageFromAddUser} />
                <h1 className='welcome-title'>{isEditingUser ? 'Edit User' : 'Add Users'}</h1>
                </div>
                <div className='user-grid-container'>

                  {/* Left Navigation */}
                  <div className='add-users-nav'>
                      <h2 className={activeSection === 'personalInformation' ? 'active-nav' : ''} onClick={() => setActiveSection('personalInformation')}>Personal Information</h2>
                      <h2 className={activeSection === 'team' ? 'active-nav' : ''} onClick={() => setActiveSection('team')}>Team & Role</h2>
                      {!isEditingUser && (
                      <h2 className={activeSection === 'invitation' ? 'active-nav' : ''} onClick={() => setActiveSection('invitation')}>Invitation</h2>
                      )}
                  </div>

                  <div className="vertical-divider"></div>

                  {/* Right Form Content */}
                  <div className='add-users-form'>
                      {/* PERSONAL INFORMATION */}
                      {activeSection === 'personalInformation' && (
                      <form onSubmit={handleNextFromPersonalInfo}>
                          <h2>Personal Information</h2>
                          <p>Enter the user's personal information.</p>

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

                      {/* TEAM & ROLE */}
                      {activeSection === 'team' && (
                      <form onSubmit={isEditingUser ? handleSaveEditedUser : handleNextFromTeam}>
                          <h2>Team & Role</h2>
                          <p>Assign the user to a role and team.</p>

                          <label htmlFor='memberRole'>Select the role:</label>
                          <div className="team-limit-radio-group">
                          {memberRoles.map((option, index) => (
                              <label key={index} className={`radio-box ${selected === option.value ? 'selected' : ''}`}>
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

                          <br />

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
                          {isEditingUser ? (
                              <button type='submit' className='admin-button'>Save</button>
                          ) : (
                              <button type='submit' className='admin-button'>Next</button>
                          )}
                          </div>
                      </form>
                      )}

                      {/* INVITATION */}
                      {!isEditingUser && activeSection === 'invitation' && (
                      <form onSubmit={handleSubmitInvitation}>
                          <h2>Invitation</h2>
                          <p>Send an invitation to the user to join the team.</p>

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
                              fetchTeamMembers(managerTeams);
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
        </>
      ) : (
        <>
          <div className='users-container'>
            <h1 className='welcome-title'>Users in Your Teams</h1>
            <div className='button-container'>
              <button className='admin-button' onClick={handleAddUserClick}>Add Users</button>
            </div>
          </div>
          <div>
            {teamMembers.length > 0 ? (
              <table className='user-table'>
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <tr key={member.id}>
                      <td>{member.firstName} {member.lastName}</td>
                      <td>{member.emailAddress}</td>
                      <td>{member.phoneNumber}</td>
                      <td>{member.memberRole}</td>
                      <td>{member.shortDescription}</td>
                      <td>
                        {member.invitationAccepted ? (
                          <span>Accepted</span>
                        ) : (
                          <>
                          <FaRegCopy
                            style={{ cursor: 'pointer', marginLeft: '8px' }}
                            title='Copy Invitation Link'
                            onClick={() => {
                              const link = `http://localhost:5173/invite/${member.invitationId}`;
                              navigator.clipboard.writeText(link);
                              toast.success("Invitation Link Copied");
                            }}
                          />
                          <span> Pending</span>
                          </>
                        )}
                      </td>
                      <td>
                        <FaEdit 
                          size={28}
                          style={{ cursor: 'pointer', marginRight: '5px' }}
                          onClick={() => {
                            setIsEditingUser(true);
                            setIsAddingUser(true);
                            setEditingUserId(member.id);
                            setUserFormData({
                              firstName: member.firstName,
                              lastName: member.lastName,
                              emailAddress: member.emailAddress,
                              phoneNumber: member.phoneNumber,
                              shortDescription: member.shortDescription,
                              memberRole: member.memberRole
                            });
                            setSelected(member.memberRole);
                            setSelectedTeam(member.teamName);
                            setActiveSection('personalInformation');
                            fetchTeams(); 
                          }}
                        />
                        <MdDelete 
                          size={28}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setUserToDelete(member);
                            setShowDeleteModal(true);
                          }}
                          />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'white' }}>No users found for your teams.</p>
            )}
          </div>
        </>
      )}

      {/* SUCCESS MODAL */}
      {showUserAddedModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <Lottie animationData={successAnimation} loop={false} autoplay style={{ height: 150, width: 150, margin: '0 auto' }} />
            <h2>Success!</h2>
            <p>
              {successActionType === 'edit'
                ? 'User updated successfully.'
                : successActionType === 'delete'
                ? 'User deleted successfully.'
                : 'User invited successfully.'}
            </p>
            <button className='admin-button' onClick={() => setShowUserAddedModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <Lottie animationData={deleteAnimation} loop autoplay style={{ height: 150, width: 150, margin: '0 auto' }} />
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete {userToDelete?.firstName} {userToDelete?.lastName}?</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="admin-button" onClick={() => setShowDeleteModal(false)} style={{ marginRight: '10px' }}>Cancel</button>
              <button
                className="admin-button"
                onClick={async () => {
                  if (!userToDelete) return;

                  try {
                    await deleteDoc(doc(db, 'teamMembers', userToDelete.id));
                    setShowDeleteModal(false);
                    setSuccessActionType('delete'); 
                    setShowUserAddedModal(true); 
                    setUserToDelete(null);
                    fetchTeamMembers(managerTeams);
                  } catch (error) {
                    console.error("Error deleting user:", error);
                    toast.error("Failed to delete user.");
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ManagerUsers;