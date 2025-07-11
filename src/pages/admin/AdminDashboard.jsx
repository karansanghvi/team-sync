import React, { useEffect, useState } from 'react';
import "../../assets/styles/admin.css";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
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

function AdminDashboard() {
  const [numberTeams, setNumberTeams] = useState(0);
  const [numberAcceptedUsers, setNumberAcceptedUsers] = useState(0);
  const [numberPendingInvites, setNumberPendingInvites] = useState(0);
  const [taskData, setTaskData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  const COLORS = ['#00C49F', '#FFBB28', '#FF6F61'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamsSnapshot = await getDocs(collection(db, 'teams'));
        setNumberTeams(teamsSnapshot.size);

        const membersSnapshot = await getDocs(collection(db, 'teamMembers'));
        let accepted = 0;
        let pending = 0;

        membersSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.invitationAccepted) accepted++;
          else pending++;
        });

        setNumberAcceptedUsers(accepted);
        setNumberPendingInvites(pending);

        // Fetch and process task data
        const tasksSnapshot = await getDocs(collection(db, 'tasks'));
        let completed = 0, inProgress = 0, cannotComplete = 0;
        tasksSnapshot.forEach(doc => {
          const status = doc.data().status;
          if (status === 'Completed') completed++;
          else if (status === 'In Progress') inProgress++;
          else if (status === 'Cannot Complete') cannotComplete++;
        });

        setTaskData([
          { name: 'Completed', value: completed },
          { name: 'In Progress', value: inProgress },
          { name: 'Cannot Complete', value: cannotComplete },
        ]);

        // Fetch and process attendance data
        const attendanceSnapshot = await getDocs(collection(db, 'attendance'));
        const monthlyAttendance = {};

        attendanceSnapshot.forEach(doc => {
          const data = doc.data();
          const date = new Date(data.date);
          const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });

          if (!monthlyAttendance[month]) {
            monthlyAttendance[month] = { month, Present: 0, Leave: 0, 'Work From Home': 0 };
          }

          if (data.status in monthlyAttendance[month]) {
            monthlyAttendance[month][data.status]++;
          }
        });

        const sortedAttendance = Object.values(monthlyAttendance).sort(
          (a, b) => new Date(`1 ${a.month}`) - new Date(`1 ${b.month}`)
        );

        setAttendanceData(sortedAttendance);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div>
        <div className="card-grid">
          <div className="info-card" style={{ color: 'white' }}>
            <h2 style={{ marginBottom: '0px', marginTop: '0px' }}>Number Of Teams</h2>
            <p style={{ marginTop: '4px', marginBottom: '0px', fontSize: '30px', fontWeight: '600' }}>{numberTeams}</p>
          </div>
          <div className="info-card" style={{ color: 'white' }}>
            <h2 style={{ marginBottom: '0px', marginTop: '0px' }}>Number Of Users</h2>
            <p style={{ marginTop: '4px', marginBottom: '0px', fontSize: '30px', fontWeight: '600' }}>{numberAcceptedUsers}</p>
          </div>
          <div className="info-card" style={{ color: 'white' }}>
            <h2 style={{ marginBottom: '0px', marginTop: '0px' }}>Users With Pending Invites</h2>
            <p style={{ marginTop: '4px', marginBottom: '0px', fontSize: '30px', fontWeight: '600' }}>{numberPendingInvites}</p>
          </div>
        </div>

        {/* CHARTS */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '10px',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          {/* Pie Chart */}
          <div className='info-card' style={{ flex: 1, minWidth: '300px', height: '400px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <h1 style={{ textAlign: 'center', color: 'white' }}>Task Overview</h1>
          </div>

          {/* Bar Chart */}
          <div className='info-card' style={{ flex: 1, minWidth: '300px', height: '400px' }}>
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
            <h1 style={{ textAlign: 'center', color: 'white' }}>Attendance Overview</h1>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
