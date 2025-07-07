import React, { useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

// const events = [
//   {
//     title: 'Team Meeting',
//     start: new Date(2025, 6, 15, 10, 0),
//     end: new Date(2025, 6, 15, 11, 0),
//     allDay: false,
//   },
//   {
//     title: 'All Day Hackathon',
//     start: new Date(2025, 6, 18),
//     end: new Date(2025, 6, 18),
//     allDay: true,
//   },
// ];

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');

  return (
    <>
      <h1 className='welcome-title'>Calendar</h1>
      <div style={{ height: '80vh', margin: '20px' }}>
        <BigCalendar
          localizer={localizer}
          // events={events}
          startAccessor="start"
          endAccessor="end"
          views={['month', 'week', 'day', 'agenda']}
          view={view}
          onView={(newView) => setView(newView)}
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          popup
          style={{ height: '100%', backgroundColor: 'white', borderRadius: '10px', padding: '20px' }}
        />
      </div>
    </>
  );
}

export default Calendar;
