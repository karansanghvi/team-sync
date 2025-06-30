import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../assets/styles/modal.css'
import successAnimation from '../../assets/animations/success.json'; 
import deleteAnimation from '../../assets/animations/delete.json';

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

  return (
    <>
    {/* TEAM HOME PAGE */}
      {!isCreatingTeam && !isTeamInformation && (
        <>
          <div className='users-container'>
            <h1 className='welcome-title'>Team</h1>
            <div className='button-container'>
              <button className='admin-button' onClick={handleCreateTeamClick}>Create Team</button>
            </div>
          </div>

          <div className='team-details'>
            {teamList.length === 0 ? (
              <p>No teams created yet.</p>
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
      {isCreatingTeam && !isTeamInformation && (
        <div className='add-users-container'>
          <h1 className='welcome-title'>{isEditingTeam ? 'Edit Team': 'Create Team'}</h1>
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
      {isTeamInformation && selectedTeam && (
        <div className="team-details-section">
          <h1 className="welcome-title">{selectedTeam.teamName}</h1>

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

          <div className='team-info-button-two'>
            <button type='button' className='admin-button' onClick={() => setShowDeleteModal(true)}>Delete</button>
            <button
              type='button'
              className='admin-button'
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
            >
              Edit
            </button>
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
