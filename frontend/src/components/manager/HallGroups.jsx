import React from 'react';

const HallGroups = ({ halls, onSelect }) => {
  // Group halls by group name
  const groups = halls?.reduce((acc, hall) => {
    const group = hall.hall_group || 'Unassigned';
    if (!acc[group]) acc[group] = [];
    acc[group].push(hall);
    return acc;
  }, {}) || {};

  return (
    <div className="hall-groups">
      <h2>🏢 Hall Groups</h2>
      
      <div className="groups-grid">
        {Object.entries(groups).map(([groupName, groupHalls]) => (
          <div key={groupName} className="group-card">
            <h3>{groupName}</h3>
            <p>Total Halls: {groupHalls.length}</p>
            <p>Booked: {groupHalls.filter(h => h.status === 'booked').length}</p>
            <p>Available: {groupHalls.filter(h => h.status === 'available').length}</p>
            <button 
              className="btn-primary btn-sm"
              onClick={() => onSelect(groupName)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HallGroups;