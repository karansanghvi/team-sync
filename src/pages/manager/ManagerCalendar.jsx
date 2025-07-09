import React, { useState, useEffect } from 'react';
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

function ManagerCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'tasks'));
        console.log('📦 Firebase Snapshot Size:', snapshot.size);

        const fetchedEvents = snapshot.docs.map((doc, index) => {
          const data = doc.data();
          console.log(`🔍 Task ${index + 1}:`, data);

          if (!data.dueDate) {
            console.warn(`⚠️ Skipping task ${index + 1} due to missing dueDate`);
            return null;
          }

          const dateParts = data.dueDate.split('-');
          if (dateParts.length !== 3) {
            console.warn(`❌ Invalid dueDate format for task ${index + 1}:`, data.dueDate);
            return null;
          }

          const dueDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0);
          console.log(`📅 Parsed dueDate:`, dueDate);

          return {
            title: `${data.taskTitle} - Assigned to ${data.assignedToName || 'Unknown'}`,
            start: dueDate,
            end: dueDate,
            allDay: true,
          };
        }).filter(event => event !== null); 

        console.log('✅ Events to show in calendar:', fetchedEvents);
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('🔥 Error fetching tasks:', error);
      }
    };

    fetchTasks();
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
          style={{ height: '100%', backgroundColor: 'white', borderRadius: '10px', padding: '20px' }}
        />
      </div>
      <br />
    </>
  );
}

export default ManagerCalendar;
