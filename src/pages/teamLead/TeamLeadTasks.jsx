import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { FaEdit } from 'react-icons/fa';
import Lottie from 'lottie-react';
import successAnimation from '../../assets/animations/success.json';
import { MdDelete } from 'react-icons/md';
import deleteAnimation from '../../assets/animations/delete.json';

function TeamLeadTasks() {
  const [tasks, setTasks] = useState([]);
  const [showTodayTaskForm, setShowTodayTaskForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [teamLeadData, setTeamLeadData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successActionType, setSuccessActionType] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [currentAssignedPage, setCurrentAssignedPage] = useState(1);
  const [assignedRowsPerPage, setAssignedRowsPerPage] = useState(5);

  const indexOfLastTask = currentAssignedPage * assignedRowsPerPage;
  const indexOfFirstTask = indexOfLastTask - assignedRowsPerPage;
  const currentAssignedTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalAssignedPages = Math.ceil(tasks.length / assignedRowsPerPage);

  useEffect(() => {
    const fetchTasks = async (email) => {
        const q = query(collection(db, 'tasks'), where('assignedTo', '==', email));
        const querySnapshot = await getDocs(q);
        const taskData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTasks(taskData);
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
        setCurrentUser(user);
        fetchTasks(user.email);

        const teamLeadRef = doc(db, 'teamLeads', user.uid);
        const teamLeadSnap = await getDoc(teamLeadRef);
        if (teamLeadSnap.exists()) {
            setTeamLeadData(teamLeadSnap.data());
        }
        }
    });

    return () => unsubscribe();
  }, []);


  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, { status: newStatus });

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleTodayTaskClick = () => {
    setShowTodayTaskForm(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();

    if (!title || !description || !dueDate) {
        alert("Please fill all fields.");
        return;
    }

    try {
        if (isEditing) {
            // UPDATE
            const taskRef = doc(db, 'tasks', editingTaskId);
            await updateDoc(taskRef, {
                taskTitle: title,
                taskDescription: description,
                dueDate,
            });
            setSuccessActionType('edit');
            setShowSuccessModal(true);
        } else {
            // CREATE
            await addDoc(collection(db, "tasks"), {
                taskTitle: title,
                taskDescription: description,
                dueDate,
                assignedBy: currentUser.email,
                assignedByName: teamLeadData.firstName + " " + teamLeadData.lastName,
                assignedTo: currentUser.email,
                assignedToName: teamLeadData.firstName + " " + teamLeadData.lastName,
                teamName: teamLeadData.teamName || "",
                status: "In Progress",
                createdAt: serverTimestamp(),
            });
            setSuccessActionType('add');
            setShowSuccessModal(true);
        }

        setShowTodayTaskForm(false);
        setTitle('');
        setDescription('');
        setDueDate('');
        setIsEditing(false);
        setEditingTaskId(null);

        const q = query(collection(db, 'tasks'), where('assignedTo', '==', currentUser.email));
        const querySnapshot = await getDocs(q);
        const taskData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTasks(taskData);
    } catch (error) {
        console.error("Error saving task:", error);
        alert("Failed to save task");
    }
  };

  useEffect(() => {
    setCurrentAssignedPage(1);
  }, [tasks]);

  return (
    <>
      {showTodayTaskForm ? (
        <div className='today-task-form'>
          <h1 className='welcome-title'>
            {isEditing ? 'Edit the Task You Plan to Complete Today ' : 'Add a Task You Plan to Complete Today'}
          </h1>
          <div className='info-card' style={{ color: 'white' }}>
            <form className='assign-task-form' onSubmit={handleSubmitTask}>
                <div className='form-group'>
                    <label style={{ color: 'white' }}>Task Title:</label>
                    <input text="text" className='input-box' placeholder='Enter task title' value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <br />
                <div className='form-group'>
                    <label style={{ color: 'white' }}>Description:</label>
                    <textarea className='textarea-box' placeholder='Enter task description' value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label style={{ color: 'white' }}>Today's Date:</label>
                    <br />
                    <input type="date" className="input-box" value={dueDate} onChange={(e) => setDueDate(e.target.value)} min={new Date().toISOString().split('T')[0]} max={new Date().toISOString().split('T')[0]} required />
                </div>
                <br />
                <button className='admin-button' type='submit'>
                    {isEditing ? 'Edit Task' : 'Create Task'}
                </button>
            </form>
          </div>
        </div>
      ) : (
        <div>
          <div className='users-container'>
            <h1 className='welcome-title'>Tasks</h1>
            <div className='button-container'>
              <button className='today-task-button' onClick={handleTodayTaskClick}>
                Add Today's Task
              </button>
            </div>
          </div>

          {tasks.length > 0 ? (
            <div>
              <table className='user-table'>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Due Date</th>
                    <th>Assigned By</th>
                    <th>Team</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAssignedTasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.taskTitle}</td>
                      <td>{task.taskDescription}</td>
                      <td>{task.dueDate}</td>
                      <td>{task.assignedByName} ({task.assignedBy})</td>
                      <td>{task.teamName}</td>
                      <td>
                        <>
                            <select
                                value={task.status || "In Progress"}
                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                disabled={task.status === "Completed"}
                                style={{ marginRight: '10px' }}
                                className='dropdown'
                            >
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Cannot Complete">Cannot Complete</option>
                            </select>
                        </>
                      </td>
                      <td>
                        {task.assignedBy === currentUser?.email && (
                            <>
                            <FaEdit 
                                size={30} 
                                style={{ cursor: 'pointer', color: 'white', marginRight: '10px' }} 
                                title='Edit Task'
                                onClick={() => {
                                setIsEditing(true);
                                setEditingTaskId(task.id);
                                setTitle(task.taskTitle);
                                setDescription(task.taskDescription);
                                setDueDate(task.dueDate);
                                setShowTodayTaskForm(true);
                                }}
                            />
                            <MdDelete
                                size={30}
                                style={{ cursor: 'pointer', color: 'white' }}
                                title='Delete Task'
                                onClick={() => {
                                setTaskToDelete(task);
                                setShowDeleteModal(true);
                                }}
                            />
                            </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', paddingBottom: '20px' }}>
                <div style={{ color: 'white' }}>
                  {tasks.length > 0 &&
                    `${indexOfFirstTask + 1}-${Math.min(indexOfLastTask, tasks.length)} of ${tasks.length}`}
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
            </div>
          ) : (
            <p>No tasks assigned.</p>
          )}
        </div>
      )}

    {/* SUCCESS MODAL */}
    {showSuccessModal && (
    <div className="modal-overlay">
        <div className="modal-box">
        <Lottie 
            animationData={successAnimation} 
            loop={false} 
            autoplay 
            style={{ height: 150, width: 150, margin: '0 auto' }} 
        />
        <h2>Success!</h2>
        <p>
            {successActionType === 'edit'
            ? 'Task updated successfully.'
            : successActionType === 'delete'
            ? 'Task deleted successfully.'
            : 'Task added successfully.'}
        </p>
        <button className='admin-button' onClick={() => setShowSuccessModal(false)}>Close</button>
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
        <p>Are you sure you want to delete this task: <strong>{taskToDelete?.taskTitle}</strong>?</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <button
                className="admin-button"
                onClick={() => setShowDeleteModal(false)}
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
                setSuccessActionType('delete');
                setShowSuccessModal(true);
                setTaskToDelete(null);

                // Refresh tasks
                const q = query(collection(db, 'tasks'), where('assignedTo', '==', currentUser.email));
                const querySnapshot = await getDocs(q);
                const taskData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTasks(taskData);
                } catch (error) {
                console.error("Error deleting task:", error);
                alert("Failed to delete task.");
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

export default TeamLeadTasks;
