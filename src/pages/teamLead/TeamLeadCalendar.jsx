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

function TeamLeadCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [events, setEvents] = useState([]);

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

        const tasksSnapshot = await getDocs(collection(db, 'tasks'));

        const filteredEvents = tasksSnapshot.docs
          .map(doc => {
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
            };
          })
          .filter(Boolean);

        setEvents(filteredEvents);
      } catch (err) {
        console.error('🔥 Error fetching team lead calendar tasks:', err);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchTeamAndTasks(user);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <h1 className='welcome-title'>Team Calendar</h1>

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
            let backgroundColor = '#3174ad'; // default (In Progress)

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

export default TeamLeadCalendar;
