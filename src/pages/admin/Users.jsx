import React, { useEffect, useState } from 'react';
import '../../assets/styles/admin.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

function Users() {

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [activeSection, setActiveSection] = useState('personalInformation');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    phoneNumber: '',
    shortDescription: '',
    selectedTeamName: ''
  });

  const handleAddUserClick = () => {
    setIsAddingUser(true);
  };

  const handleUserInputChange = (e) => {
    setUserFormData({ ...userFormData, [e.target.id]: e.target.value })
  };

  const fetchTeams = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'teams'));
      const teamData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeams(teamData);
    } catch (error) {
      console.error("Error fetching teams:", error)
    }
  };

  useEffect(() => {
    if (isAddingUser) {
      fetchTeams();
    }
  }, [isAddingUser]);

  return (
    <>
      {!isAddingUser ? (
        <div className='users-container'>
          <h1 className='welcome-title'>Users</h1>
          <div className='button-container'>
            <button id="addUsers" className='admin-button' onClick={handleAddUserClick}>Add Users</button>
          </div>
        </div>
      ) : (
        <div className='add-users-container'>
          <h1 className='welcome-title'>Add Users</h1>
           <div className='user-grid-container'>
            <div className='add-users-nav'>
              <h2
                id='personalInformation'
                className={activeSection === 'personalInformation' ? 'active-nav' : ''}
                onClick={() => setActiveSection('personalInformation')}
              >
                Personal Information
              </h2>

              <h2
                id='team'
                className={activeSection === 'team' ? 'active-nav' : ''}
                onClick={() => setActiveSection('team')}
              >
                Team
              </h2>

              <h2
                id='invitation'
                className={activeSection === 'invitation' ? 'active-nav' : ''}
                onClick={() => setActiveSection('invitation')}
              >
                Invitation
              </h2>
            </div>

            <div className="vertical-divider"></div> 

            <div className='add-users-form'>
              {/* PERSONAL INFORMATION */}
                {activeSection === 'personalInformation' && (
                  <div>
                    <h2 style={{ marginBottom: '0px' }}>Personal Information</h2>
                    <p style={{ marginTop: '0px' }}>Enter the user's personal information.</p>
                    <form>
                    <div className='name-grid'>
                      <div>
                        <label htmlFor='fullName'>First Name:</label>
                        <input type="text" id="firstName" value={userFormData.firstName} onChange={handleUserInputChange} className='input-box' placeholder='John' required/>
                      </div>
                      <div>
                        <label htmlFor='lastName'>Last Name:</label>
                        <input type="text" id="lastName" value={userFormData.lastName} onChange={handleUserInputChange} className='input-box' placeholder='Doe' required/>
                      </div>
                    </div>

                    <br/>

                      <div className='name-grid'>
                      <div>
                        <label htmlFor='userEmailAddress'>Email Address:</label>
                        <input type="email" id="userEmailAddress" value={userFormData} onChange={handleUserInputChange} className='input-box' placeholder='johndoe@gmail.com' required/>
                      </div>
                      <div>
                        <label htmlFor='userPassword'>Password:</label>
                        <input type="password" id="userPassword" value={userFormData} onChange={handleUserInputChange} className='input-box' placeholder='Password' required/>
                      </div>
                    </div>

                    <div className='parent-box'>
                      <label htmlFor='userDescription'>Short Description:</label>
                      <br/>
                      <textarea id="userDescription" value={userFormData} onChange={handleUserInputChange} className='description-box' placeholder='Type a description about the user...'/>
                    </div>

                    <div className='personal-info-button'>
                      <button type='submit' className='admin-button'>Next</button>
                    </div>
                    </form>
                  </div>
                )}

              {/* TEAM */}
                {activeSection === 'team' && (
                  <div>
                    <h2 style={{ marginBottom: '0px' }}>Team</h2>
                    <p style={{ marginTop: '0px' }}>Assign the user to a team.</p>
                    <div className='team-list'>
                      {teams.length === 0 ? (
                        <p>No teams available</p>
                      ) : (
                          <div className='team-limit-radio-group'>
                            {teams.map((team) => (
                              <label
                                key={team.id}
                                className={`radio-box ${selectedTeam === team.teamName ? 'selected' : ''}`}
                              >
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
                        )}
                    </div>
                    <div className='team-info-button-two'>
                      <button type='button' className='admin-button' onClick={() => setActiveSection('personalInformation')}>Back</button>
                      <button type='submit' className='admin-button'>Next</button>
                    </div>
                  </div>
                )}
              
              {/* INVITATION */}
                {activeSection === 'invitation' && (
                  <form>
                    <div>
                      <h2 style={{ marginBottom: '0px' }}>Invitation</h2>
                      <p style={{ marginTop: '0px' }}>Send an invitation to the user to join the team.</p>
                      <input type="text" id="invitationLink" className='input-box' placeholder='Invitation'/>

                      <div className='team-info-button-two'>
                        <button type='button' className='admin-button' onClick={() => setActiveSection('categorization')}>Back</button>
                        <button type='submit' className='admin-button'>Submit</button>
                      </div>
                    </div>
                  </form>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Users
