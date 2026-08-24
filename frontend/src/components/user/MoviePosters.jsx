import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/api';
import '../../styles/MoviePosters.css';

const MoviePosters = ({ onEventSelect }) => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadEvents, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadEvents = async () => {
    try {
      const response = await eventService.getEvents({ status: 'upcoming' });
      setEvents(response.data.data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All', icon: '🎬' },
    { id: 'movie', label: 'Movies', icon: '🎥' },
    { id: 'concert', label: 'Concerts', icon: '🎵' },
    { id: 'drama', label: 'Dramas', icon: '🎭' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'live', label: 'Live Now', icon: '🔴' }
  ];

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.category === filter);

  // Sort: Live events first
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (a.is_live_now && !b.is_live_now) return -1;
    if (!a.is_live_now && b.is_live_now) return 1;
    return 0;
  });

  return (
    <div className="movie-posters-container">
      {/* Category Filters */}
      <div className="category-filters">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-btn ${filter === cat.id ? 'active' : ''}`}
            onClick={() => setFilter(cat.id)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Poster Grid */}
      <div className="poster-grid">
        {loading ? (
          <div className="loading-spinner">Loading events...</div>
        ) : sortedEvents.length === 0 ? (
          <div className="no-events">No events available</div>
        ) : (
          sortedEvents.map(event => (
            <div 
              key={event.event_id} 
              className={`poster-card ${event.is_live_now ? 'live' : ''}`}
              onClick={() => onEventSelect(event)}
            >
              <div className="poster-image">
                {event.poster_url ? (
                  <img src={event.poster_url} alt={event.title} />
                ) : (
                  <div className="poster-placeholder">
                    <span className="poster-emoji">🎬</span>
                  </div>
                )}
                {event.is_live_now && (
                  <div className="live-badge">
                    <span className="live-dot"></span>
                    LIVE NOW
                  </div>
                )}
                <div className="poster-overlay">
                  <div className="poster-info">
                    <h3>{event.title}</h3>
                    <p>{event.date} at {event.time}</p>
                    <p className="seats-left">
                      🪑 {event.available_seats} seats left
                    </p>
                    <p className="ticket-price">₹{event.ticket_price}</p>
                    <button className="book-now-btn">Book Now</button>
                  </div>
                </div>
              </div>
              <div className="poster-footer">
                <span className="event-category">{event.category}</span>
                <span className="event-status">
                  {event.is_live_now ? '🔴 Live' : 'Upcoming'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MoviePosters;