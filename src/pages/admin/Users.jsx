import React, { useState } from 'react';
import '../../assets/styles/admin.css';

function Users() {

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [activeSection, setActiveSection] = useState('personalInformation');

  const handleAddUserClick = () => {
    setIsAddingUser(true);
  };

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
            </div>

            <div className="vertical-divider"></div> 

            <div className='add-users-form'>
              {activeSection === 'personalInformation' && (
                <div>
                  <h2 style={{ marginBottom: '0px' }}>Personal Information</h2>
                  <p style={{ marginTop: '0px' }}>Enter the user's personal information.</p>
                  <form>
                   <div className='name-grid'>
                     <div>
                      <label htmlFor='fullName'>First Name:</label>
                      <input type="text" id="firstName" className='input-box' placeholder='John' required/>
                    </div>
                    <div>
                      <label htmlFor='lastName'>Last Name:</label>
                      <input type="text" id="lastName" className='input-box' placeholder='Doe' required/>
                    </div>
                   </div>

                   <br/>

                    <div className='name-grid'>
                     <div>
                      <label htmlFor='userEmailAddress'>Email Address:</label>
                      <input type="email" id="userEmailAddress" className='input-box' placeholder='johndoe@gmail.com' required/>
                    </div>
                    <div>
                      <label htmlFor='userPassword'>Password:</label>
                      <input type="password" id="userPassword" className='input-box' placeholder='Password' required/>
                    </div>
                   </div>

                   <div className='parent-box'>
                    <label htmlFor='userDescription'>Short Description:</label>
                    <br/>
                    <textarea id="userDescription" className='description-box' placeholder='Type a description about the user...'/>
                   </div>

                   <div className='personal-info-button'>
                    <button type='submit' className='admin-button'>Next</button>
                   </div>
                  </form>
                </div>
              )}

              {activeSection === 'team' && (
                <div>
                  <h2 style={{ marginBottom: '0px' }}>Team</h2>
                  <p style={{ marginTop: '0px' }}>Assign the user to a team.</p>
                </div>
              )}
            </div>
          </div>

          {/* <button className='admin-button' onClick={handleBack}>Back</button> */}
        </div>
      )}
    </>
  )
}

export default Users
