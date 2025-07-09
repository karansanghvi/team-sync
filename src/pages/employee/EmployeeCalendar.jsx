import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../firebase';

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

function EmployeeCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchTasksForEmployee = async (email) => {
      try {
        const q = query(collection(db, 'tasks'), where('assignedTo', '==', email));
        const snapshot = await getDocs(q);

        const fetchedEvents = snapshot.docs.map((doc) => {
          const data = doc.data();
          if (!data.dueDate) return null;

          const dateParts = data.dueDate.split('-');
          if (dateParts.length !== 3) return null;

          const dueDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0);
          return {
            title: data.taskTitle,
            start: dueDate,
            end: dueDate,
            allDay: true,
          };
        }).filter(Boolean);

        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching employee tasks:', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchTasksForEmployee(user.email);
      }
    });

    return () => unsubscribe();
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
        />
      </div>
      <br />
    </>
  );
}

export default EmployeeCalendar;
