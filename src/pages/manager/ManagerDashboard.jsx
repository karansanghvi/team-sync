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
  CartesianGrid,
} from 'recharts';

function ManagerDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [cannotCompleteCount, setCannotCompleteCount] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const fetchTeamStats = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            // Get team name of logged-in manager
            const managerQuery = query(
              collection(db, 'managers'),
              where('email', '==', user.email)
            );
            const managerSnapshot = await getDocs(managerQuery);

            if (!managerSnapshot.empty) {
              const managerData = managerSnapshot.docs[0].data();
              const teamName = managerData.teamName;

              // Get accepted team members
              const membersQuery = query(
                collection(db, 'teamMembers'),
                where('teamName', '==', teamName),
                where('invitationAccepted', '==', true)
              );
              const membersSnapshot = await getDocs(membersQuery);
              const teamEmails = membersSnapshot.docs.map(doc => doc.data().emailAddress);
              setUserCount(teamEmails.length);

              // Filter tasks by team members and team name
              const allTasksSnapshot = await getDocs(collection(db, 'tasks'));
              const teamTasks = allTasksSnapshot.docs.filter(doc => {
                const data = doc.data();
                return teamEmails.includes(data.assignedTo) && data.teamName === teamName;
              });

              const completed = teamTasks.filter(task => task.data().status === "Completed").length;
              const inProgress = teamTasks.filter(task => task.data().status === "In Progress").length;
              const cannotComplete = teamTasks.filter(task => task.data().status === "Cannot Complete").length;

              setCompletedCount(completed);
              setInProgressCount(inProgress);
              setCannotCompleteCount(cannotComplete);

              setChartData([
                { name: 'Completed', value: completed },
                { name: 'In Progress', value: inProgress },
                { name: 'Cannot Complete', value: cannotComplete },
              ]);

              // Fetch attendance and group month-wise
              const attendanceQuery = query(collection(db, 'attendance'));
              const attendanceSnapshot = await getDocs(attendanceQuery);

              const attendanceRaw = [];

              attendanceSnapshot.forEach(doc => {
                const data = doc.data();
                if (teamEmails.includes(data.email)) {
                  const date = new Date(data.date);
                  const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                  attendanceRaw.push({ month, status: data.status });
                }
              });

              const groupedAttendance = {};

              attendanceRaw.forEach(({ month, status }) => {
                if (!groupedAttendance[month]) {
                  groupedAttendance[month] = { month, Present: 0, Leave: 0, 'Work From Home': 0 };
                }
                groupedAttendance[month][status] += 1;
              });

              const graphData = Object.values(groupedAttendance).sort((a, b) => {
                const [aMonth, aYear] = a.month.split(' ');
                const [bMonth, bYear] = b.month.split(' ');
                return new Date(`${aMonth} 1, ${aYear}`) - new Date(`${bMonth} 1, ${bYear}`);
              });

              setAttendanceData(graphData);
            }
          } catch (error) {
            console.error("Error fetching manager dashboard data:", error);
          }
        }
      });
    };

    fetchTeamStats();
  }, []);

  const COLORS = ['#00C49F', '#FFBB28', '#FF6F61'];

  return (
    <div>
      <div className='card-grid-two'>
        <div className="info-card" style={{ color: 'white' }}>
          <h2 style={{ marginBottom: '0px', marginTop: '0px' }}>Users In Your Team</h2>
          <p style={{ marginTop: '4px', marginBottom: '0px', fontSize: '30px', fontWeight: '600' }}>{userCount}</p>
        </div>
        <div className="info-card" style={{ color: 'white' }}>
          <h2 style={{ marginBottom: '0px', marginTop: '0px' }}>Tasks Completed</h2>
          <p style={{ marginTop: '4px', marginBottom: '0px', fontSize: '30px', fontWeight: '600' }}>{completedCount}</p>
        </div>
        <div className="info-card" style={{ color: 'white' }}>
          <h2 style={{ marginBottom: '0px', marginTop: '0px' }}>Tasks In Progress</h2>
          <p style={{ marginTop: '4px', marginBottom: '0px', fontSize: '30px', fontWeight: '600' }}>{inProgressCount}</p>
        </div>
        <div className="info-card" style={{ color: 'white' }}>
          <h2 style={{ marginBottom: '0px', marginTop: '0px' }}>Cannot Complete</h2>
          <p style={{ marginTop: '4px', marginBottom: '0px', fontSize: '30px', fontWeight: '600' }}>{cannotCompleteCount}</p>
        </div>
      </div>

      <div
        style={{
          marginTop: '30px',
          display: 'flex',
          gap: '20px',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        {/* TASKS PIE CHART */}
        {chartData.length > 0 && (
          <div
            className='info-card'
            style={{
              flex: '1 1 45%',
              minWidth: '300px',
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
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <h1 style={{ textAlign: 'center', color: 'white' }}>Team's Task Status</h1>
          </div>
        )}

        {/* ATTENDANCE BAR CHART */}
        {attendanceData.length > 0 && (
          <div
            className='info-card'
            style={{
              flex: '1 1 45%',
              minWidth: '300px',
              height: '400px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
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
            <h1 style={{ textAlign: 'center', color: 'white' }}>Team's Attendance Status</h1>
          </div>
        )}
      </div>
      <br/> <br/>
    </div>
  );
}

export default ManagerDashboard;
