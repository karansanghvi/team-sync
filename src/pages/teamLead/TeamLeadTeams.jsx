import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import noTeams from "../../assets/images/team.png";
import { IoArrowBackCircleSharp } from 'react-icons/io5';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import successAnimation from '../../assets/animations/success.json';
import { FaBell, FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import deleteAnimation from '../../assets/animations/delete.json';

function TeamLeadTeams() {
  const [teamDetails, setTeamDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [currentTeamMembers, setCurrentTeamMembers] = useState([]);
  const [showAssignTaskForm, setShowAssignTaskForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [showTaskSuccessModal, setShowTaskSuccessModal] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskBeingEdited, setTaskBeingEdited] = useState(null);
  const [taskSuccessMessage, setTaskSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [currentAssignedPage, setCurrentAssignedPage] = useState(1);
  const [assignedRowsPerPage, setAssignedRowsPerPage] = useState(5);

  const indexOfLastMember = currentPage * rowsPerPage;
  const indexOfFirstMember = indexOfLastMember - rowsPerPage;
  const currentMembers = currentTeamMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(currentTeamMembers.length / rowsPerPage);

  const indexOfLastTask = currentAssignedPage * assignedRowsPerPage;
  const indexOfFirstTask = indexOfLastTask - assignedRowsPerPage;
  const currentAssignedTasks = assignedTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalAssignedPages = Math.ceil(assignedTasks.length / assignedRowsPerPage);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const teamLeadQuery = query(
              collection(db, 'teamLeads'),
              where('email', '==', user.email)
            );
            const teamLeadSnapshot = await getDocs(teamLeadQuery);

            if (!teamLeadSnapshot.empty) {
              const teamLeadDoc = teamLeadSnapshot.docs[0];
              const { teamName } = teamLeadDoc.data();

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
              console.error('Team Lead not found');
            }
          } catch (error) {
            console.error('Error fetching team details:', error);
          }
        }
      });
    };

    fetchTeamDetails();
  }, []);

  const fetchAssignedTasks = async () => {
    if (!selectedMember) return;

    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('assignedTo', '==', selectedMember.emailAddress)
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssignedTasks(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchAssignedTasks();
  }, [selectedMember]);


  const handleGoToManagerTeamFromTeamDetails = () => {
    setShowDetails(false);
  };

  const handleGoToSelectedTeamFromSelectedMemberDetails = () => {
    setSelectedMember(null);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();

    if (!taskTitle || !taskDescription || !dueDate) {
      toast.info("All fields are required");
      return;
    }

    try {
      const user = auth.currentUser;

      if (isEditingTask && taskBeingEdited) {
        const taskRef = doc(db, "tasks", taskBeingEdited.id);
        await updateDoc(taskRef, {
          taskTitle,
          taskDescription,
          dueDate,
          updatedAt: serverTimestamp()
        });

        setTaskSuccessMessage("Task updated successfully.");
        setShowTaskSuccessModal(true);
      } else {
        await addDoc(collection(db, "tasks"), {
          taskTitle,
          taskDescription,
          dueDate,
          assignedTo: selectedMember.emailAddress,
          assignedToName: `${selectedMember.firstName} ${selectedMember.lastName}`,
          teamName: selectedMember.teamName,
          assignedBy: user.email,
          assignedByName: user.displayName || 'Manager',
          createdAt: serverTimestamp()
        });

        setTaskSuccessMessage("Task assigned successfully.");
        setShowTaskSuccessModal(true);
      }

      setTaskTitle('');
      setTaskDescription('');
      setDueDate('');
      setIsEditingTask(false);
      setTaskBeingEdited(null);
      setShowAssignTaskForm(false);
      fetchAssignedTasks();
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("Error submitting task");
    }
  };

  const handleEditClick = (task) => {
    setTaskTitle(task.taskTitle);
    setTaskDescription(task.taskDescription);
    setDueDate(task.dueDate);
    setTaskBeingEdited(task);
    setIsEditingTask(true);
    setShowAssignTaskForm(true);
  };

  return (
  <>
    {teamDetails ? (
      showAssignTaskForm ? (
        // Assign Task Form Page
        <div className='assign-task-section'>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <IoArrowBackCircleSharp
              size={28}
              color='white'
              style={{ cursor: 'pointer' }}
              onClick={() => setShowAssignTaskForm(false)}
            />
            {isEditingTask ? (
              <h1 className="welcome-title">Edit Task of {selectedMember?.firstName} {selectedMember?.lastName}</h1>
            ) : (
              <h1 className="welcome-title">Assign Task to {selectedMember?.firstName} {selectedMember?.lastName}</h1>
            )}
          </div>

          <div className="info-card" style={{ color: 'white' }}>
            <form className="assign-task-form" onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label style={{ color: 'white' }}>Task Title:</label>
                <input type="text" className="input-box" placeholder="Enter task title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required />
              </div>
              <br/>
              <div className="form-group">
                <label style={{ color: 'white' }}>Description:</label>
                <textarea className="textarea-box" placeholder="Enter task description" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} required />
              </div>
              <br/>
              <div className="form-group">
                <label style={{ color: 'white' }}>Due Date:</label>
                <br />
                <input type="date" className="input-box" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
              </div>
              <br />
              {isEditingTask ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="admin-button"
                    type="button"
                    onClick={() => {
                      setIsEditingTask(false);
                      setTaskBeingEdited(null);
                      setShowAssignTaskForm(false);
                      setTaskTitle('');
                      setTaskDescription('');
                      setDueDate('');
                    }}
                  >
                    Cancel
                  </button>
                  <button className="admin-button" type="submit">
                    Update Task
                  </button>
                </div>
              ) : (
                <button className="admin-button" type="submit">
                  Assign Task
                </button>
              )}
            </form>
          </div>
        </div>
      ) : selectedMember ? (
        // Selected Member Details Page
        <>
          <div className='member-details-section'>
            <div className='users-container'>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <IoArrowBackCircleSharp
                  size={28}
                  color='white'
                  style={{ cursor: 'pointer' }}
                  onClick={handleGoToSelectedTeamFromSelectedMemberDetails}
                />
                <h1 className="welcome-title">Team Member: {selectedMember.firstName} {selectedMember.lastName}</h1>
              </div>
              <div className='button-container'>
                <button className='admin-button' onClick={() => setShowAssignTaskForm(true)}>Assign Task</button>
              </div>
            </div>
            <div className='info-card' style={{ color: 'white' }}>
              <p style={{marginTop: '2px', marginBottom: '2px'}}><strong>Email Address:</strong> {selectedMember.emailAddress}</p>
              <p style={{marginTop: '0px', marginBottom: '2px'}}><strong>Phone Number:</strong> {selectedMember.phoneNumber}</p>
              <p style={{marginTop: '2px', marginBottom: '2px'}}><strong>Role:</strong> {selectedMember.memberRole}</p>
              <p style={{marginTop: '2px', marginBottom: '2px'}}><strong>Team Name:</strong> {selectedMember.teamName}</p>
              <p style={{marginTop: '0px', marginBottom: '2px'}}><strong>Description:</strong> {selectedMember.shortDescription}</p>
            </div>
          </div>

          <h2 style={{ marginBottom: '10px', color: 'white', marginTop: '40px' }}>Assigned Tasks</h2>
          <div style={{ color: 'white' }}>
            {assignedTasks.length === 0 ? (
              <p>No assigned tasks yet.</p>
            ) : (
              <>
                <table className='user-table'>
                  <thead>
                      <tr>
                        <th>Task Title</th>
                        <th>Description</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                        <th>Remind</th>
                      </tr>
                  </thead>
                  <tbody>
                    {currentAssignedTasks.map((task) => (
                      <tr key={task.id}>
                        <td>{task.taskTitle}</td>
                        <td>{task.taskDescription}</td>
                        <td>{task.dueDate}</td>
                        <td>
                          <FaEdit size={24} style={{ cursor: 'pointer', marginRight: '5px' }} onClick={() => handleEditClick(task)} />
                          <MdDelete 
                            size={24} 
                            style={{ cursor: 'pointer' }} 
                            onClick={() => {
                              setTaskToDelete(task);
                              setShowDeleteModal(true);
                            }}
                          />
                        </td>
                        <td>
                          <FaBell size={24} style={{ cursor: 'pointer' }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', paddingBottom: '20px' }}>
                  <div style={{ color: 'white' }}>
                    {assignedTasks.length > 0 &&
                      `${indexOfFirstTask + 1}-${Math.min(indexOfLastTask, assignedTasks.length)} of ${assignedTasks.length}`}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label htmlFor="assignedRowsPerPage" style={{ color: 'white' }}>Rows per page:</label>
                    <select
                      id="assignedRowsPerPage"
                      value={assignedRowsPerPage}
                      onChange={(e) => {
                        setAssignedRowsPerPage(parseInt(e.target.value));
                        setCurrentAssignedPage(1);
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
                      disabled={currentAssignedPage === 1}
                      onClick={() => setCurrentAssignedPage(prev => prev - 1)}
                      style={{
                        cursor: currentAssignedPage === 1 ? 'not-allowed' : 'pointer',
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '16px'
                      }}
                    >
                      ◀
                    </button>

                    <button
                      disabled={currentAssignedPage >= totalAssignedPages}
                      onClick={() => setCurrentAssignedPage(prev => prev + 1)}
                      style={{
                        cursor: currentAssignedPage >= totalAssignedPages ? 'not-allowed' : 'pointer',
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
              </>
            )}
          </div>
        </>
      ) : showDetails ? (
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
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Team Name</th>
                  <th>Short Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentMembers.map((member) => (
                  <tr key={member.id}>
                    <td>{member.firstName}</td>
                    <td>{member.lastName}</td>
                    <td>{member.emailAddress}</td>
                    <td>{member.phoneNumber}</td>
                    <td>{member.memberRole}</td>
                    <td>{member.teamName}</td>
                    <td>{member.shortDescription}</td>
                    <td>
                      <button
                        className='team-member-button'
                        onClick={() => setSelectedMember(member)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
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
        // Manager Team Details Home Page
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

    {/* SUCCESS MODAL */}
    {showTaskSuccessModal && (
      <div className="modal-overlay">
        <div className="modal-box">
          <Lottie 
            animationData={successAnimation} 
            loop={false} 
            autoplay 
            style={{ height: 150, width: 150, margin: '0 auto' }} 
          />
          <h2>Success!</h2>
          <p>{taskSuccessMessage}</p>
          <button className="admin-button" onClick={() => setShowTaskSuccessModal(false)}>Close</button>
        </div>
      </div>
    )}

    {/* DELETE MODAL */}
    {showDeleteModal && (
      <div className="modal-overlay">
        <div className="modal-box">
          <Lottie
            animationData={deleteAnimation}
            loop
            autoplay
            style={{ height: 150, width: 150, margin: '0 auto' }}
          />
          <h2>Confirm Deletion</h2>
          <p>Are you sure you want to delete the task <strong>{taskToDelete?.taskTitle}</strong>?</p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              className="admin-button"
              onClick={() => {
                setTaskToDelete(null);
                setShowDeleteModal(false);
              }}
              style={{ marginRight: '10px' }}
            >
              Cancel
            </button>
            <button
              className="admin-button"
              onClick={async () => {
                if (!taskToDelete) return;

                try {
                  await deleteDoc(doc(db, 'tasks', taskToDelete.id));
                  setShowDeleteModal(false);
                  setTaskSuccessMessage("Task deleted successfully.");
                  setShowTaskSuccessModal(true);
                  setTaskToDelete(null);
                  fetchAssignedTasks();
                } catch (error) {
                  console.error("Error deleting task:", error);
                  toast.error("Failed to delete task.");
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

export default TeamLeadTeams;
