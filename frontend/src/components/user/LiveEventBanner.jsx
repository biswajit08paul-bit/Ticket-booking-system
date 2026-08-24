import React from 'react';

const LiveEventBanner = ({ liveEvents }) => {
  if (!liveEvents || liveEvents.length === 0) {
    return null;
  }

  return (
    <div className="live-banner">
      <div className="live-banner-content">
        <span className="live-icon">🔴</span>
        <span className="live-text">LIVE NOW</span>
        {liveEvents.map(event => (
          <span key={event.event_id} className="live-event-name">
            {event.title} 🎬
          </span>
        ))}
      </div>
    </div>
  );
};

export default LiveEventBanner;