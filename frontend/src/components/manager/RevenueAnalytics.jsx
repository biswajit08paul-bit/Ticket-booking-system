import React from 'react';

const RevenueAnalytics = ({ events, halls }) => {
  const totalRevenue = events?.reduce((sum, e) => sum + parseFloat(e.revenue || 0), 0) || 0;
  const totalBookings = events?.reduce((sum, e) => sum + (e.total_bookings || 0), 0) || 0;

  return (
    <div className="revenue-analytics">
      <h2>💰 Revenue Analytics</h2>
      
      <div className="revenue-stats">
        <div className="stat-card">
          <h3>₹{totalRevenue.toLocaleString()}</h3>
          <p>Total Revenue</p>
        </div>
        <div className="stat-card">
          <h3>{totalBookings}</h3>
          <p>Total Bookings</p>
        </div>
        <div className="stat-card">
          <h3>{halls?.length || 0}</h3>
          <p>Total Halls</p>
        </div>
      </div>

      <div className="revenue-table">
        <h3>Event-wise Revenue</h3>
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Bookings</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {events?.map(event => (
              <tr key={event.event_id}>
                <td>{event.title}</td>
                <td>{event.total_bookings || 0}</td>
                <td>₹{event.revenue || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueAnalytics;