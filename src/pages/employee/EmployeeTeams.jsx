import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import noTeams from "../../assets/images/team.png";
import { IoArrowBackCircleSharp } from 'react-icons/io5';

function EmployeeTeams() {
  const [teamDetails, setTeamDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentTeamMembers, setCurrentTeamMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const indexOfLastMember = currentPage * rowsPerPage;
  const indexOfFirstMember = indexOfLastMember - rowsPerPage;
  const currentMembers = currentTeamMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(currentTeamMembers.length / rowsPerPage);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const employeeQuery = query(
              collection(db, 'employees'),
              where('email', '==', user.email)
            );
            const employeeSnapshot = await getDocs(employeeQuery);

            if (!employeeSnapshot.empty) {
              const employeeDoc = employeeSnapshot.docs[0];
              const { teamName } = employeeDoc.data();

              const teamQuery = query(
                collection(db, 'teams'),
                where('teamName', '==', teamName)
              );
              const teamSnapshot = await getDocs(teamQuery);

              if (!teamSnapshot.empty) {
                const teamData = teamSnapshot.docs[0].data();
                setTeamDetails(teamData);

                const teamMembersQuery = query(
                  collection(db, 'teamMembers'),
                  where('teamName', '==', teamData.teamName),
                  where('invitationAccepted', '==', true)
                );
                const membersSnapshot = await getDocs(teamMembersQuery);

                const members = membersSnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data(),
                }));

                const filteredMembers = members.filter(member => member.emailAddress !== user.email);
                setCurrentTeamMembers(filteredMembers);

              } else {
                console.error('Team not found');
              }
            } else {
              console.error('Employee not found');
            }
          } catch (error) {
            console.error('Error fetching team details:', error);
          }
        }
      });
    };

    fetchTeamDetails();
  }, []);

  const handleGoToManagerTeamFromTeamDetails = () => {
    setShowDetails(false);
  };

  return (
    <>
      {teamDetails ? (
        showDetails ? (
          // Selected Team Details Page
          <>
            <div className='team-details-section'>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <IoArrowBackCircleSharp
                  size={28}
                  color='white'
                  style={{ cursor: 'pointer' }}
                  onClick={handleGoToManagerTeamFromTeamDetails}
                />
                <h1 className="welcome-title">Team Name: {teamDetails.teamName}</h1>
              </div>

              <div className='card-grid'>
                <div className="info-card">
                  <h2 style={{marginBottom: '0px', marginTop: '0px'}}>Team Overview</h2>
                  <p style={{marginTop: '4px', marginBottom: '4px'}}><strong>Description:</strong> {teamDetails.teamDescription}</p>
                  <p style={{marginTop: '0px', marginBottom: '4px'}}><strong>Member Limit:</strong> {teamDetails.teamLimit}</p>
                </div>

                <div className="info-card">
                  <h2 style={{marginBottom: '0px' , marginTop: '0px'}}>Department Information</h2>
                  <p style={{marginTop: '4px', marginBottom: '4px'}}><strong>Department:</strong> {teamDetails.department}</p>
                  <p style={{marginTop: '0px', marginBottom: '4px'}}><strong>Sub-Department:</strong> {teamDetails.subDepartment}</p>
                </div>

                <div className="info-card">
                  <h2  style={{marginBottom: '0px', marginTop: '0px'}}>Goals & Vision</h2>
                  <p style={{marginTop: '4px', marginBottom: '4px'}}><strong>Goals:</strong> {teamDetails.teamGoals}</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '30px', paddingLeft: '20px' }}>
              <h2 style={{ color: 'white' }}>Team Members</h2>
              <table className='user-table'>
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Team Name</th>
                    <th>Short Description</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMembers.map((member) => (
                    <tr key={member.id}>
                      <td>{member.firstName} {member.lastName}</td>
                      <td>{member.emailAddress}</td>
                      <td>{member.phoneNumber}</td>
                      <td>{member.memberRole}</td>
                      <td>{member.teamName}</td>
                      <td>{member.shortDescription}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', paddingBottom: '20px' }}>
                <div style={{ color: 'white' }}>
                  {currentTeamMembers.length > 0 &&
                    `${indexOfFirstMember + 1}-${Math.min(indexOfLastMember, currentTeamMembers.length)} of ${currentTeamMembers.length}`}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label htmlFor="rowsPerPage" style={{ color: 'white' }}>Rows per page:</label>
                  <select
                    id="rowsPerPage"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{
                      backgroundColor: 'white',
                      color: 'black',
                      border: '1px solid #444',
                      borderRadius: '4px',
                      padding: '4px',
                      fontSize: '15px'
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>

                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    style={{
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      fontSize: '16px'
                    }}
                  >
                    ◀
                  </button>

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    style={{
                      cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      fontSize: '16px'
                    }}
                  >
                    ▶
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className='welcome-title' style={{ paddingLeft: '20px' }}>Teams</h1>
            <div className="team">
              <div className='tech-card'>
                <h3 className='tech-title' style={{ marginBottom: '0px' }}>{teamDetails.teamName}</h3>
                <p className='tech-description' style={{ marginTop: '0px' }}>{teamDetails.teamDescription}</p>
                <button
                  className='tech-button'
                  onClick={() => setShowDetails(true)}
                >
                  View More
                </button>
              </div>
            </div>
          </>
        )
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', marginTop: '70px' }}>
          <img src={noTeams} alt='No Teams' width={200} height={200} />
          <h1 className='not-available'>No Teams Added Yet!!</h1>
        </div>
      )}
    </>
  );
}

export default EmployeeTeams;