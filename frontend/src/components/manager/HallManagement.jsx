import React, { useState } from 'react';
import { hallService } from '../../services/api';
import '../../styles/HallManagement.css';

const HallManagement = ({ halls, onUpdate }) => {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [showBooking, setShowBooking] = useState(false);
  const [selectedHall, setSelectedHall] = useState(null);

  // Group halls by author/owner
  const groupedHalls = halls.reduce((acc, hall) => {
    const group = hall.hall_group || 'Unassigned';
    if (!acc[group]) acc[group] = [];
    acc[group].push(hall);
    return acc;
  }, {});

  const groups = ['all', ...Object.keys(groupedHalls)];

  const filteredHalls = selectedGroup === 'all' 
    ? halls 
    : groupedHalls[selectedGroup] || [];

  const handleBookHall = async (hall) => {
    try {
      await hallService.bookHall({
        hall_id: hall.hall_id,
        duration: hall.booking_duration || 30 // days
      });
      onUpdate();
      setShowBooking(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to book hall');
    }
  };

  const handleReleaseHall = async (hallId) => {
    if (window.confirm('Release this hall?')) {
      try {
        await hallService.releaseHall(hallId);
        onUpdate();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to release hall');
      }
    }
  };

  return (
    <div className="hall-management">
      <div className="hall-header">
        <h2>🏢 Hall Management</h2>
        <div className="group-filters">
          {groups.map(group => (
            <button
              key={group}
              className={`group-btn ${selectedGroup === group ? 'active' : ''}`}
              onClick={() => setSelectedGroup(group)}
            >
              {group === 'all' ? 'All Groups' : group}
              <span className="group-count">
                {group === 'all' ? halls.length : (groupedHalls[group]?.length || 0)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="hall-grid">
        {filteredHalls.map(hall => (
          <div key={hall.hall_id} className={`hall-card ${hall.status}`}>
            <div className="hall-info">
              <h4>{hall.hall_name}</h4>
              <p className="hall-group">Group: {hall.hall_group || 'N/A'}</p>
              <p>🪑 {hall.total_seats} seats</p>
              <p>Available: {hall.available_seats}</p>
              <p className="price">₹{hall.price_per_seat}/seat</p>
              {hall.status === 'booked' && (
                <p className="booked-until">
                  📅 Booked until: {new Date(hall.booked_until).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="hall-actions">
              <span className={`status-badge ${hall.status}`}>
                {hall.status === 'available' ? '✅ Available' : 
                 hall.status === 'booked' ? '📅 Booked' : '🔧 Maintenance'}
              </span>
              {hall.status === 'available' && (
                <button 
                  className="btn-book"
                  onClick={() => {
                    setSelectedHall(hall);
                    setShowBooking(true);
                  }}
                >
                  Book Hall
                </button>
              )}
              {hall.status === 'booked' && (
                <button 
                  className="btn-release"
                  onClick={() => handleReleaseHall(hall.hall_id)}
                >
                  Release
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showBooking && selectedHall && (
        <div className="booking-modal">
          <div className="modal-content">
            <h3>Book Hall: {selectedHall.hall_name}</h3>
            <p>Price per day: ₹{selectedHall.price_per_seat * 10}</p>
            <div className="modal-actions">
              <button 
                className="btn-primary"
                onClick={() => handleBookHall(selectedHall)}
              >
                Confirm Booking
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setShowBooking(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HallManagement;