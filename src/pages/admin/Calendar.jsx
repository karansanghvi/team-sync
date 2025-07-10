import React, { useEffect, useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskSnap, attendanceSnap] = await Promise.all([
          getDocs(collection(db, 'tasks')),
          getDocs(collection(db, 'attendance')),
        ]);

        // 🔹 Map Tasks
        const taskEvents = taskSnap.docs.map((doc) => {
          const data = doc.data();

          if (!data.dueDate) return null;

          const dateParts = data.dueDate.split('-');
          if (dateParts.length !== 3) return null;

          const dueDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0);

          return {
            title: `${data.taskTitle} - Assigned to ${data.assignedToName || 'Unknown'}`,
            assignedTo: data.assignedTo || 'No Name',
            start: dueDate,
            end: dueDate,
            allDay: true,
            status: data.status || 'In Progress',
            type: 'task',
          };
        }).filter(Boolean);

        // 🔹 Map Attendance
        const attendanceEvents = attendanceSnap.docs.map((doc) => {
          const data = doc.data();
          if (!data.date) return null;

          const [y, m, d] = data.date.split('-');
          const dateObj = new Date(y, m - 1, d, 12, 0);

          return {
            title: `${data.displayName || data.email} - ${data.status}`,
            start: dateObj,
            end: dateObj,
            allDay: true,
            type: 'attendance',
            status: data.status,
          };
        }).filter(Boolean);

        // ✅ Combine all events
        setEvents([...taskEvents, ...attendanceEvents]);
      } catch (error) {
        console.error('🔥 Error fetching calendar data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <h1 className='welcome-title'>Calendar</h1>
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
          style={{
            height: '100%',
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '20px',
          }}
          eventPropGetter={(event) => {
            let backgroundColor = '#3174ad'; // Default: In Progress Task

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

export default Calendar;
