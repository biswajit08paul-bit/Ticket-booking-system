import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/api';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingService.getBookings();
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading bookings...</div>;

  if (bookings.length === 0) {
    return (
      <div className="no-bookings">
        <h3>No Bookings Yet</h3>
        <p>Start exploring events and book your tickets!</p>
      </div>
    );
  }

  return (
    <div className="booking-history">
      <h2>My Bookings</h2>
      {bookings.map(booking => (
        <div key={booking.booking_id} className="booking-card">
          <div className="booking-info">
            <h4>{booking.Event?.title || 'Event'}</h4>
            <p>Seats: {booking.seats?.join(', ') || 'N/A'}</p>
            <p>Date: {booking.booking_date}</p>
            <p className="price">Total: ₹{booking.total_amount}</p>
            <span className={`status ${booking.status}`}>
              {booking.status}
            </span>
          </div>
          {booking.qr_code && (
            <img src={booking.qr_code} alt="QR Code" className="qr-code" />
          )}
        </div>
      ))}
    </div>
  );
};

export default BookingHistory;