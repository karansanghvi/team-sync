import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../firebase';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function EmployeeCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [events, setEvents] = useState([]);
  const [userData, setUserData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [teamName, setTeamName] = useState('');

  const fetchAttendance = async (email) => {
    const q = query(collection(db, 'attendance'), where('email', '==', email));
    const snapshot = await getDocs(q);
    const data = {};

    snapshot.forEach((doc) => {
      const d = doc.data();
      data[d.date] = d.status;
    });

    return data;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userInfo = {
          email: user.email,
          uid: user.uid,
          displayName: user.displayName || '',
        };
        setUserData(userInfo);

        // 🔍 Get teamName from employees table
        const empQuery = query(
          collection(db, 'employees'),
          where('email', '==', user.email)
        );
        const empSnap = await getDocs(empQuery);
        let fetchedTeamName = '';

        if (!empSnap.empty) {
          const empData = empSnap.docs[0].data();
          fetchedTeamName = empData.teamName || '';
          setTeamName(fetchedTeamName);
        }

        const [taskSnap, attendanceMap] = await Promise.all([
          getDocs(query(collection(db, 'tasks'), where('assignedTo', '==', user.email))),
          fetchAttendance(user.email),
        ]);

        const taskEvents = taskSnap.docs
          .map((doc) => {
            const data = doc.data();
            if (!data.dueDate) return null;
            const [y, m, d] = data.dueDate.split('-');
            const dueDate = new Date(y, m - 1, d, 12, 0);
            return {
              title: data.taskTitle,
              start: dueDate,
              end: dueDate,
              allDay: true,
              type: 'task',
              status: data.status || 'In Progress',
            };
          })
          .filter(Boolean);

        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const attendanceEvents = [];

        for (let i = start.getDate(); i <= end.getDate(); i++) {
          const date = new Date(start.getFullYear(), start.getMonth(), i, 12, 0);
          const dateStr = format(date, 'yyyy-MM-dd');
          const status = attendanceMap[dateStr];

          attendanceEvents.push({
            title: status || 'Mark Attendance',
            start: date,
            end: date,
            allDay: true,
            type: 'attendance',
            dateStr,
            attendance: status || null,
          });
        }

        setEvents([...taskEvents, ...attendanceEvents]);
      }
    });

    return () => unsubscribe();
  }, [currentDate]);

  const handleAttendanceChange = async (status) => {
    if (!selectedDate || !userData) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    await addDoc(collection(db, 'attendance'), {
      email: userData.email,
      uid: userData.uid,
      displayName: userData.displayName,
      date: dateStr,
      status,
      teamName: teamName || '', // ✅ Save teamName
    });

    setEvents((prev) =>
      prev.map((event) =>
        event.type === 'attendance' && event.dateStr === dateStr
          ? { ...event, title: status, attendance: status }
          : event
      )
    );

    setSelectedDate(null);
  };

  return (
    <>
      <h1 className='welcome-title'>Calendar</h1>
      {!selectedDate && (
        <p style={{ color: 'white' }}>Click A Date To Mark Your Attendance</p>
      )}
      {selectedDate && (
        <div>
          <label style={{ marginBottom: '0px', color: 'white' }}>Mark Attendance for {format(selectedDate, 'PPP')}:</label>
          <br/>
          <select
            defaultValue=""
            onChange={(e) => handleAttendanceChange(e.target.value)}
            className='dropdown'
          >
            <option value="">Select</option>
            <option value="Present">Present</option>
            <option value="Leave">Leave</option>
            <option value="Work From Home">Work From Home</option>
          </select>
        </div>
      )}
      <div style={{ height: '80vh', margin: '20px' }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={['month', 'week', 'day', 'agenda']}
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={setCurrentDate}
          selectable
          onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start)}
          onSelectEvent={(event) => {
            if (event.type === 'attendance') {
              setSelectedDate(event.start);
            }
          }}
          tooltipAccessor={(event) => event.title}
          popup
          style={{
            height: '100%',
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '20px',
          }}
          eventPropGetter={(event) => {
            let backgroundColor = 'lightgray';

            if (event.type === 'task') {
              if (event.status === 'Completed') backgroundColor = 'green';
              else if (event.status === 'Cannot Complete') backgroundColor = 'red';
              else backgroundColor = 'orange';
            } else if (event.type === 'attendance') {
              if (event.attendance === 'Present') backgroundColor = 'green';
              else if (event.attendance === 'Leave') backgroundColor = 'red';
              else if (event.attendance === 'Work From Home') backgroundColor = 'blue';
              else backgroundColor = '#f3f3f3';
            }

            return {
              style: {
                backgroundColor,
                color: 'white',
                borderRadius: '5px',
                padding: '5px',
              },
            };
          }}
        />
      </div>
      <br/>
    </>
  );
}

export default EmployeeCalendar;
