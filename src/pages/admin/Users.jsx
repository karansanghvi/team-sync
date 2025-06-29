import React from 'react';
import '../../assets/styles/admin.css';

function Users() {
  return (
    <>
      <div className='users-container'>
        <h1 className='welcome-title'>Users</h1>
        <div className='button-container'>
           <button id="addMembers" className='admin-button'>Add Users</button>
        </div>
      </div>
    </>
  )
}

export default Users
