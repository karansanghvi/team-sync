import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../assets/styles/modal.css'
import successAnimation from '../../assets/animations/success.json'; 
import deleteAnimation from '../../assets/animations/delete.json';
import noTeams from '../../assets/images/no_users.png';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { IoArrowBackCircleSharp } from 'react-icons/io5';

function Team() {
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isTeamInformation, setIsTeamInformation] = useState(false);
  const [activeSection, setActiveSection] = useState('basic Information');
  const [selected, setSelected] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamList, setTeamList] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDeleteSuccess, setIsDeleteSuccess] = useState(false);

  const [formData, setFormData] = useState({
    teamName: '',
    teamDescription: '',
    department: '',
    subDepartment: '',
    teamGoals: '',
    teamLimit: ''
  });

  const handleCreateTeamClick = () => setIsCreatingTeam(true);

  const options = [
    { label: "1–5 members", value: "5" },
    { label: "6–10 members", value: "10" },
    { label: "11–20 members", value: "20" },
    { label: "21–30 members", value: "30" },
    { label: "31–50 members", value: "50" },
    { label: "Unlimited", value: "unlimited" },
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalData = { ...formData, teamLimit: selected };

    try {
      if (isEditingTeam && selectedTeam?.id) {
        const docRef = doc(db, 'teams', selectedTeam.id);
        await updateDoc(docRef, finalData);
      } else {
        await addDoc(collection(db, 'teams'), finalData);
      }

      setShowModal(true);
    } catch (error) {
      console.error("Error saving team: ", error);
    }
  };

  const fetchTeams = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'teams'));
      const teams = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeamList(teams);
    } catch (error) {
      console.error("Error fetching teams: ", error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!selectedTeam?.teamName) return;

      try {
        const querySnapshot = await getDocs(collection(db, 'teamMembers'));
        const members = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(
            member =>
              member.teamName === selectedTeam.teamName &&
              member.invitationAccepted === true
          );
        setTeamMembers(members);
      } catch (error) {
        console.error("Error fetching team members: ", error);
      }
    };
    fetchTeamMembers();
  }, [selectedTeam]);

  const confirmDeleteTeam = async () => {
    if (!selectedTeam?.id) return;

    try {
      await deleteDoc(doc(db, 'teams', selectedTeam.id));

      setShowDeleteModal(false);
      setIsTeamInformation(false);
      setSelectedTeam(null);
      setIsEditingTeam(false); 
      setIsDeleteSuccess(true); 
      setShowModal(true);
      fetchTeams();
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  const handleGoToTeamPageFromCreateTeam = () => {
    setIsCreatingTeam(false);
    setIsEditingTeam(false);
    setFormData({
      teamName: '',
      teamDescription: '',
      department: '',
      subDepartment: '',
      teamGoals: '',
      teamLimit: '',
    });
    setSelected('');
    setActiveSection('basic Information');
  };

  const handleGoToTeamPageFromTeamDetails = () => {
    setIsTeamInformation(false);
    setSelectedTeam(null);
  };

  const handleGoToSelectedTeamFromSelectedMemberDetails = () => {
    setSelectedMember(null);
  }

  return (
    <>
      {/* TEAM HOME PAGE */}
      {!isCreatingTeam && !isTeamInformation && !selectedMember && (
        <>
          <div className='users-container'>
            <h1 className='welcome-title'>Team</h1>
            <div className='button-container'>
              <button className='admin-button' onClick={handleCreateTeamClick}>Create Team</button>
            </div>
          </div>

          <div className='team-details'>
            {teamList.length === 0 ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', marginTop: '70px' }}>
                  <img src={noTeams} alt='No Teams' width={200} height={200} />
                  <h1 className='not-available'>No Teams Added Yet!!</h1>
                </div>
              </>
            ) : (
               <>
                <div className='team'>
                  {teamList.map((team) => (
                    <div key={team.id} className='tech-card'>
                      <h3 style={{marginBottom: '0px'}} className='tech-title'>{team.teamName}</h3>
                      <p style={{marginTop: '0px'}} className='tech-description'>{team.teamDescription}</p>
                      <button
                        className='tech-button'
                        onClick={() => {
                          setSelectedTeam(team);        
                          setIsTeamInformation(true);  
                        }}
                      >
                        More Info
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* CREATE TEAM */}
      {isCreatingTeam && !isTeamInformation && !selectedMember && (
        <div className='add-users-container'>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <IoArrowBackCircleSharp size={28} color='white' style={{ cursor: 'pointer' }} onClick={handleGoToTeamPageFromCreateTeam} />
            <h1 className='welcome-title'>{isEditingTeam ? 'Edit Team': 'Create Team'}</h1>
          </div>
          <div className='user-grid-container'>
            {/* NAVIGATION */}
            <div className='add-users-nav'>
              {['basic Information', 'categorization', 'settings'].map((section) => (
                <h2
                  key={section}
                  className={activeSection === section ? 'active-nav' : ''}
                  onClick={() => setActiveSection(section)}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </h2>
              ))}
            </div>

            <div className="vertical-divider"></div>

            {/* FORM SECTIONS */}
            <div className='add-users-form'>
              {activeSection === 'basic Information' && (
                <div>
                  <h2 style={{ marginBottom: '0px' }}>Basic Information</h2>
                  <p style={{ marginTop: '0px' }}>Enter the team's basic information.</p>
                  <form onSubmit={(e) => { e.preventDefault(); setActiveSection('categorization'); }}>
                    <label htmlFor='teamName'>Team Name:</label>
                    <input id="teamName" className='input-box' value={formData.teamName} onChange={handleInputChange} placeholder='Name' required />
                    <br /><br />
                    <label htmlFor='teamDescription'>Short Description:</label>
                    <textarea id="teamDescription" className='description-box-two' value={formData.teamDescription} onChange={handleInputChange} placeholder='Type a description about the team...' />
                    <div className='team-info-button'>
                      <button type='submit' className='admin-button'>Next</button>
                    </div>
                  </form>
                </div>
              )}

              {activeSection === 'categorization' && (
                <div>
                  <h2 style={{ marginBottom: '0px' }}>Categorization</h2>
                  <p style={{ marginTop: '0px' }}>Assign the team's categories.</p>
                  <form onSubmit={(e) => { e.preventDefault(); setActiveSection('settings'); }}>
                    <label htmlFor='department'>Department:</label>
                    <input id="department" className='input-box' value={formData.department} onChange={handleInputChange} placeholder='Department' required />
                    <br /><br />
                    <label htmlFor='subDepartment'>Sub-Department:</label>
                    <input id="subDepartment" className='input-box' value={formData.subDepartment} onChange={handleInputChange} placeholder='Sub-Department' />
                    <br /><br />
                    <label htmlFor='teamGoals'>Team Goals:</label>
                    <textarea id="teamGoals" className='description-box-two' value={formData.teamGoals} onChange={handleInputChange} placeholder='Type the teams goals...' />
                    <div className='team-info-button-two'>
                      <button type='button' className='admin-button' onClick={() => setActiveSection('basic Information')}>Back</button>
                      <button type='submit' className='admin-button'>Next</button>
                    </div>
                  </form>
                </div>
              )}

              {activeSection === 'settings' && (
                <div>
                  <h2 style={{ marginBottom: '0px' }}>Settings</h2>
                  <p style={{ marginTop: '0px' }}>Apply any settings if needed.</p>
                  <form onSubmit={handleSubmit}>
                    <label>Select The Team Members Limit:</label>
                    <div className="team-limit-radio-group">
                      {options.map((option, index) => (
                        <label
                          key={index}
                          className={`radio-box ${selected === option.value ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name="teamMembers"
                            value={option.value}
                            className="radio-input"
                            onChange={() => setSelected(option.value)}
                            checked={selected === option.value}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                    <br/> <br/>
                    <div className='team-info-button-two'>
                      <button type='button' className='admin-button' onClick={() => setActiveSection('categorization')}>Back</button>
                      <button type='submit' className='admin-button'>Submit</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TEAM DETAILS */}
      {isTeamInformation && selectedTeam && !selectedMember && (
        <div className="team-details-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <IoArrowBackCircleSharp size={28} color='white' style={{ cursor: 'pointer' }} onClick={handleGoToTeamPageFromTeamDetails} />
              <h1 className="welcome-title">Team Name: {selectedTeam.teamName}</h1>
            </div>
            <div className="team-details-section" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <FaEdit 
                size={28} 
                style={{ cursor: 'pointer' }} 
                onClick={() => {
                  setFormData({
                    teamName: selectedTeam.teamName,
                    teamDescription: selectedTeam.teamDescription,
                    department: selectedTeam.department,
                    subDepartment: selectedTeam.subDepartment,
                    teamGoals: selectedTeam.teamGoals,
                    teamLimit: selectedTeam.teamLimit
                  });
                  setSelected(selectedTeam.teamLimit);
                  setIsCreatingTeam(true);
                  setIsTeamInformation(false);
                  setIsEditingTeam(true);
                }}
              />
              <MdDelete size={28} style={{ cursor: 'pointer' }} onClick={() => setShowDeleteModal(true)} />
            </div>
          </div>

          <div className="card-grid">
            <div className="info-card">
              <h2 style={{marginBottom: '0px', marginTop: '0px'}}>Team Overview</h2>
              <p style={{marginTop: '4px', marginBottom: '4px'}}><strong>Description:</strong> {selectedTeam.teamDescription}</p>
              <p style={{marginTop: '0px', marginBottom: '4px'}}><strong>Member Limit:</strong> {selectedTeam.teamLimit}</p>
            </div>

            <div className="info-card">
              <h2 style={{marginBottom: '0px' , marginTop: '0px'}}>Department Info</h2>
              <p style={{marginTop: '4px', marginBottom: '4px'}}><strong>Department:</strong> {selectedTeam.department}</p>
              <p style={{marginTop: '0px', marginBottom: '4px'}}><strong>Sub-Department:</strong> {selectedTeam.subDepartment}</p>
            </div>

            <div className="info-card">
              <h2  style={{marginBottom: '0px', marginTop: '0px'}}>Goals & Vision</h2>
              <p style={{marginTop: '4px', marginBottom: '4px'}}><strong>Goals:</strong> {selectedTeam.teamGoals}</p>
            </div>
          </div>

          <div>
            {teamMembers.length > 0 ? (
              <div style={{ marginTop: '30px' }}>
                <h2>Team Members</h2>
                <table className='user-table'>
                  <thead>
                    <tr>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Short Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => (
                      <tr key={member.id}>
                        <td>{member.firstName}</td>
                        <td>{member.lastName}</td>
                        <td>{member.emailAddress}</td>
                        <td>{member.phoneNumber}</td>
                        <td>{member.memberRole}</td>
                        <td>{member.shortDescription}</td>
                        <td>
                          <button className='team-member-button' onClick={() => setSelectedMember(member)}>View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ marginTop: '30px' }}><i>No team members have accepted the invitation yet.</i></p>
            )}
          </div>
        </div>
      )}

      {/* SELECTED MEMBER DETAILS */}
      {selectedMember && (
        <div className='member-details-section'>
           <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <IoArrowBackCircleSharp size={28} color='white' style={{ cursor: 'pointer' }} onClick={handleGoToSelectedTeamFromSelectedMemberDetails} />
              <h1 className="welcome-title">Team Member Details</h1>
            </div>
          <div className='info-card' style={{ color: 'white' }}>
            <p><strong>Name:</strong> {selectedMember.firstName} {selectedMember.lastName}</p>
            <p><strong>Email:</strong> {selectedMember.emailAddress}</p>
            <p><strong>Phone:</strong> {selectedMember.phoneNumber}</p>
            <p><strong>Role:</strong> {selectedMember.memberRole}</p>
            <p><strong>Description:</strong> {selectedMember.shortDescription}</p>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showModal && (
      <div className="modal-overlay">
        <div className="modal-box">
          <Lottie 
            animationData={successAnimation} 
            loop={true} 
            autoplay 
            style={{ height: 150, width: 150, margin: '0 auto' }}
          />
          <h2 style={{ marginBottom: '0px' }}>Success!</h2>
          <p style={{ marginTop: '0px' }}>
            {isDeleteSuccess ? 'The team has been deleted.' : 'Your team has been created.'}
          </p>
          <button
            className='admin-button'
            onClick={() => {
              setShowModal(false);
              setIsCreatingTeam(false);
              setIsEditingTeam(false);
              setSelectedTeam(null);
              setFormData({
                teamName: '',
                teamDescription: '',
                department: '',
                subDepartment: '',
                teamGoals: '',
                teamLimit: ''
              });
              setSelected('');
              setActiveSection('basic Information');
              setIsDeleteSuccess(false); // reset
              fetchTeams();
            }}
          >
            Close
          </button>
        </div>
      </div>
      )}

      {/* MODAL ON DELETE TEAM */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <Lottie 
              animationData={deleteAnimation} 
              loop={true} 
              autoplay 
              style={{ height: 150, width: 150, margin: '0 auto' }}
            />
            <h2 style={{ marginBottom: '0px' }}>Confirm Deletion</h2>
            <p style={{ marginTop: '8px' }}>
              Are you sure you want to delete {selectedTeam?.teamName}?
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button
                className="admin-button"
                onClick={() => setShowDeleteModal(false)}
                style={{marginRight: '20px'}}
              >
                Cancel
              </button>
              <button
                className="admin-button"
                onClick={confirmDeleteTeam}
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

export default Team;
