import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  addDoc,
} from 'firebase/firestore';
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

function TeamLeadCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [teamLead, setTeamLead] = useState(null);
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    const fetchTeamAndTasks = async (user) => {
      try {
        const teamLeadRef = doc(db, 'teamLeads', user.uid);
        const teamLeadSnap = await getDoc(teamLeadRef);

        if (!teamLeadSnap.exists()) {
          console.error('⚠️ No team lead data found');
          return;
        }

        const team = teamLeadSnap.data().teamName;
        setTeamName(team);
        setTeamLead({
          uid: user.uid,
          email: user.email,
          displayName: teamLeadSnap.data().displayName || user.displayName || user.email,
        });

        // 1. Fetch tasks
        const tasksSnapshot = await getDocs(collection(db, 'tasks'));

        const taskEvents = tasksSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            if (!data.dueDate || data.teamName !== team) return null;

            const dateParts = data.dueDate.split('-');
            const dueDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0);

            return {
              title: `${data.taskTitle} - ${data.assignedToName || 'Unknown'}`,
              start: dueDate,
              end: dueDate,
              allDay: true,
              status: data.status || 'In Progress',
              type: 'task',
            };
          })
          .filter(Boolean);

        // 2. Fetch attendance of all team members
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('teamName', '==', team)
        );
        const attendanceSnap = await getDocs(attendanceQuery);

        const attendanceEvents = attendanceSnap.docs.map((doc) => {
          const data = doc.data();
          const [y, m, d] = data.date.split('-');
          const dateObj = new Date(y, m - 1, d, 12, 0);

          return {
            title: `${data.displayName || data.email} - ${data.status}`,
            start: dateObj,
            end: dateObj,
            allDay: true,
            status: data.status,
            type: 'attendance',
            email: data.email,
            date: data.date,
          };
        });

        setEvents([...taskEvents, ...attendanceEvents]);
      } catch (err) {
        console.error('🔥 Error fetching team lead calendar tasks or attendance:', err);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchTeamAndTasks(user);
    });

    return () => unsubscribe();
  }, []);

  const handleMarkAttendance = async (status) => {
    if (!selectedDate || !teamLead) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    await addDoc(collection(db, 'attendance'), {
      email: teamLead.email,
      displayName: teamLead.displayName,
      date: dateStr,
      status,
      teamName,
    });

    setEvents((prev) => [
      ...prev,
      {
        title: `${teamLead.displayName} - ${status}`,
        start: selectedDate,
        end: selectedDate,
        allDay: true,
        type: 'attendance',
        status,
        email: teamLead.email,
        date: dateStr,
      },
    ]);

    setSelectedDate(null);
  };

  return (
    <>
      <h1 className='welcome-title'>Team Calendar</h1>
      {!selectedDate && (
        <p style={{ color: 'white' }}>Click A Date To Mark Your Attendance</p>
      )}
      {selectedDate && (
        <div>
          <p style={{ color: 'white' }}>Mark Your Attendance for {format(selectedDate, 'PPP')}</p>
          <select defaultValue="" onChange={(e) => handleMarkAttendance(e.target.value)} className='dropdown'>
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
          tooltipAccessor={(event) => event.title}
          views={['month', 'week', 'day', 'agenda']}
          view={view}
          onView={(newView) => setView(newView)}
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          popup
          selectable
          onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start)}
          onSelectEvent={(event) => {
            if (event.email === teamLead?.email) {
              setSelectedDate(event.start); // only allow attendance marking for self
            }
          }}
          style={{
            height: '100%',
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '20px',
          }}
          eventPropGetter={(event) => {
            let backgroundColor = '#3174ad'; // default for task

            if (event.type === 'task') {
              if (event.status === 'Completed') backgroundColor = 'green';
              else if (event.status === 'Cannot Complete') backgroundColor = 'red';
            } else if (event.type === 'attendance') {
              if (event.status === 'Present') backgroundColor = 'green';
              else if (event.status === 'Leave') backgroundColor = 'red';
              else if (event.status === 'Work From Home') backgroundColor = 'blue';
              else backgroundColor = '#ccc';
            }

            return {
              style: {
                backgroundColor,
                color: 'white',
                borderRadius: '5px',
              },
            };
          }}
        />
      </div>
      <br/>
    </>
  );
}

export default TeamLeadCalendar;
