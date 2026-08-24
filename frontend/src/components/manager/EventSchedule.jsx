import React from 'react';

const EventSchedule = ({ events, onUpdate }) => {
  return (
    <div className="event-schedule">
      <h2>📅 Event Schedule</h2>
      
      <div className="schedule-grid">
        {events?.map(event => (
          <div key={event.event_id} className={`schedule-card ${event.is_live_now ? 'live' : ''}`}>
            <div className="schedule-time">
              <span className="date">{event.date}</span>
              <span className="time">{event.time}</span>
            </div>
            <div className="schedule-info">
              <h4>{event.title}</h4>
              <p>🪑 {event.available_seats} seats left</p>
              {event.is_live_now && (
                <span className="live-badge-small">🔴 LIVE</span>
              )}
              <span className={`status ${event.status}`}>
                {event.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventSchedule;