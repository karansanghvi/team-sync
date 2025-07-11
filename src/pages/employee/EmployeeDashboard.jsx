import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

function EmployeeDashboard() {
  const [assignedCount, setAssignedCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [cannotCompleteCount, setCannotCompleteCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);

  const chartData = [
    { name: 'In Progress', value: assignedCount },
    { name: 'Completed', value: completedCount },
    { name: 'Cannot Complete', value: cannotCompleteCount },
    { name: 'Overdue', value: overdueCount },
  ];

  // TASK STATUS COUNTS
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, 'tasks'),
            where('assignedTo', '==', user.email)
          );

          const querySnapshot = await getDocs(q);

          let assigned = 0;
          let completed = 0;
          let cannotComplete = 0;
          let overdue = 0;

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const dueDate = data.dueDate ? new Date(data.dueDate) : null;

            if (data.status === 'In Progress') assigned++;
            else if (data.status === 'Completed') completed++;
            else if (data.status === 'Cannot Complete') cannotComplete++;

            if (
              data.status !== 'Completed' &&
              dueDate &&
              !isNaN(dueDate) &&
              dueDate < today
            ) {
              overdue++;
            }
          });

          setAssignedCount(assigned);
          setCompletedCount(completed);
          setCannotCompleteCount(cannotComplete);
          setOverdueCount(overdue);
        } catch (error) {
          console.error('Error fetching tasks:', error);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // ATTENDANCE GRAPH DATA
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, 'attendance'),
            where('email', '==', user.email)
          );
          const snapshot = await getDocs(q);

          const grouped = {};

          snapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.date instanceof Date ? data.date : new Date(data.date);

            const year = date.getFullYear();
            const month = date.getMonth(); // 0 for Jan, 1 for Feb...

            const key = `${year}-${month}`;

            if (!grouped[key]) {
              grouped[key] = {
                month: new Date(year, month, 1).toLocaleString('default', { month: 'short', year: 'numeric' }), // e.g., "Jan 2025"
                Present: 0,
                Leave: 0,
                'Work From Home': 0
              };
            }

            grouped[key][data.status]++;
          });

          const graphData = Object.values(grouped).sort((a, b) => {
            const [aMonth, aYear] = a.month.split(' ');
            const [bMonth, bYear] = b.month.split(' ');

            return new Date(`${aMonth} 1, ${aYear}`) - new Date(`${bMonth} 1, ${bYear}`);
          });

          setAttendanceData(graphData);
        } catch (err) {
          console.error('Error fetching attendance:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);


  return (
    <div style={{ color: 'white' }}>
      {loading ? (
        <p>Loading your tasks...</p>
      ) : (
        <>
          {/* TASK STATUS CARDS */}
          <div className='card-grid-two'>
            <div className='info-card'>
              <h2 style={{ marginBottom: '0px', marginTop: '0px' }}>Tasks In Progress</h2>
              <p style={{ marginTop: '4px', marginBottom: '0px', fontSize: '30px', fontWeight: '600' }}>{assignedCount}</p>
            </div>
            <div className='info-card'>
              <h2 style={{ marginBottom: '0px', marginTop: '0px' }}>Tasks Completed</h2>
              <p style={{ marginTop: '4px', marginBottom: '0px', fontSize: '30px', fontWeight: '600' }}>{completedCount}</p>
            </div>
            <div className='info-card'>
              <h2 style={{ marginBottom: '0px', marginTop: '0px' }}>Tasks Could Not Complete</h2>
              <p style={{ marginTop: '4px', marginBottom: '0px', fontSize: '30px', fontWeight: '600' }}>{cannotCompleteCount}</p>
            </div>
            <div className='info-card'>
              <h2 style={{ marginBottom: '0px', marginTop: '0px' }}>Overdue Tasks</h2>
              <p style={{ marginTop: '4px', marginBottom: '0px', fontSize: '30px', fontWeight: '600' }}>{overdueCount}</p>
            </div>
          </div>

          <div
            style={{
              marginTop: '30px',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'nowrap', // Ensures side-by-side layout
            }}
          >
            {/* TASK PIE CHART */}
            <div
              className='info-card'
              style={{
                width: '50%',
                height: '400px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={['#FFA500', '#00C49F', '#FF6F61', '#8884d8'][index % 4]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <h1 style={{ textAlign: 'center' }}>Task Status Overview</h1>
            </div>

            {/* ATTENDANCE BAR CHART */}
            <div
              className='info-card'
              style={{
                width: '50%',
                height: '400px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {attendanceData.length === 0 ? (
                <p>No attendance data available.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={attendanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Present" stackId="a" fill="#00C49F" />
                      <Bar dataKey="Work From Home" stackId="a" fill="#8884d8" />
                      <Bar dataKey="Leave" stackId="a" fill="#FF6F61" />
                    </BarChart>
                  </ResponsiveContainer>
                  <h1 style={{ textAlign: 'center' }}>Your Attendance</h1>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default EmployeeDashboard;
