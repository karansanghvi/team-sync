import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
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

function ManagerCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchManagerTeamTasks = async (user) => {
      try {
        // 1. Get manager's team name
        const managerRef = doc(db, 'managers', user.uid);
        const managerSnap = await getDoc(managerRef);

        if (!managerSnap.exists()) {
          console.error('⚠️ Manager data not found');
          return;
        }

        const teamName = managerSnap.data().teamName;

        // 2. Fetch all tasks
        const snapshot = await getDocs(collection(db, 'tasks'));

        // 3. Filter tasks by team name
        const filteredEvents = snapshot.docs
          .map((doc) => {
            const data = doc.data();

            if (!data.dueDate || data.teamName !== teamName) return null;

            const dateParts = data.dueDate.split('-');
            if (dateParts.length !== 3) return null;

            const dueDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0);

            return {
              title: `${data.taskTitle} - ${data.assignedToName || 'Unknown'}`,
              start: dueDate,
              end: dueDate,
              allDay: true,
              status: data.status || 'In Progress',
            };
          })
          .filter(Boolean);

        setEvents(filteredEvents);
      } catch (error) {
        console.error('🔥 Error fetching manager tasks:', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchManagerTeamTasks(user);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <h1 className='welcome-title'>Team Tasks Calendar</h1>

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
            let backgroundColor = '#3174ad';
            if (event.status === 'Completed') backgroundColor = 'green';
            else if (event.status === 'Cannot Complete') backgroundColor = 'red';

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
      <br />
    </>
  );
}

export default ManagerCalendar;
