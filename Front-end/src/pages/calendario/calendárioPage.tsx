import react from 'react'
import FullCalendar from '@fullcalendar/react';
import daygrid from '@fullcalendar/daygrid'; 
function CalendarioPage() {
  return (
    <FullCalendar
      plugins={[daygrid]}
      initialView="dayGridMonth"
      events={[
        { title: 'Example 1', date: '2025-09-01' },
        { title: 'Example 2', date: '2025-09-02' },
      ]}
    />
  );
}

export default CalendarioPage;