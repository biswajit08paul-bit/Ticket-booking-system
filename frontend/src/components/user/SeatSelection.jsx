import React, { useState, useEffect } from 'react';
import { seatService, bookingService } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import '../../styles/SeatSelection.css';

const SeatSelection = ({ event, onBack }) => {
  const { socket } = useSocket();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [holdTimer, setHoldTimer] = useState(600);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    loadSeats();
    
    // Real-time seat updates
    if (socket) {
      socket.on('seat-update', handleSeatUpdate);
    }

    // Hold timer
    const timer = setInterval(() => {
      setHoldTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          releaseAllSeats();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (socket) socket.off('seat-update');
      releaseAllSeats();
    };
  }, [event.event_id]);

  const loadSeats = async () => {
    try {
      const response = await seatService.getEventSeats(event.event_id);
      setSeats(response.data.data);
    } catch (error) {
      console.error('Error loading seats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatUpdate = (data) => {
    setSeats(prev => prev.map(seat => {
      if (seat.seat_id === data.seat_id) {
        return { ...seat, status: data.status };
      }
      return seat;
    }));
    // Update available seats count
    const available = seats.filter(s => s.status === 'available').length;
    // Emit to parent
  };

  const handleSeatClick = async (seat) => {
    if (seat.status === 'booked') return;
    
    if (selectedSeats.find(s => s.seat_id === seat.seat_id)) {
      setSelectedSeats(prev => prev.filter(s => s.seat_id !== seat.seat_id));
      return;
    }

    try {
      const response = await seatService.holdSeat({
        event_id: event.event_id,
        seat_id: seat.seat_id
      });
      
      if (response.data.success) {
        setSelectedSeats(prev => [...prev, seat]);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to hold seat');
    }
  };

  const releaseAllSeats = async () => {
    for (const seat of selectedSeats) {
      try {
        await seatService.releaseSeat({
          event_id: event.event_id,
          seat_id: seat.seat_id
        });
      } catch (error) {
        console.error('Error releasing seat:', error);
      }
    }
    setSelectedSeats([]);
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    try {
      const total = selectedSeats.reduce((sum, s) => sum + parseFloat(s.price), 0);
      const response = await bookingService.createBooking({
        event_id: event.event_id,
        seat_ids: selectedSeats.map(s => s.seat_id),
        total_amount: total
      });
      
      setBooking(response.data.data);
      // Emit real-time update
      if (socket) {
        socket.emit('booking-confirmed', {
          event_id: event.event_id,
          seats_booked: selectedSeats.length
        });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="loading">Loading seats...</div>;

  if (booking) {
    return (
      <div className="booking-success">
        <h2>✅ Booking Confirmed!</h2>
        <p>Reference: {booking.booking_reference}</p>
        <p>Seats: {selectedSeats.map(s => `${s.row}${s.seat_number}`).join(', ')}</p>
        <p>Total: ₹{booking.total_amount}</p>
        <button className="btn-primary" onClick={onBack}>
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="seat-selection-container">
      <button className="back-btn" onClick={onBack}>← Back</button>
      
      <div className="event-summary">
        <h2>{event.title}</h2>
        <p>{event.date} at {event.time}</p>
        <p>🪑 {event.available_seats} seats available</p>
        <p className="price">₹{event.ticket_price} per seat</p>
      </div>

      {selectedSeats.length > 0 && (
        <div className="selection-bar">
          <span>{selectedSeats.length} seats selected</span>
          <span className="timer">⏱️ {formatTime(holdTimer)}</span>
          <span className="total">₹{selectedSeats.reduce((sum, s) => sum + parseFloat(s.price), 0)}</span>
          <button className="btn-primary" onClick={handleBooking}>
            Confirm Booking
          </button>
          <button className="btn-secondary" onClick={releaseAllSeats}>
            Cancel Selection
          </button>
        </div>
      )}

      <div className="seat-map">
        <div className="screen">🎬 SCREEN</div>
        <div className="seat-grid">
          {seats.map(seat => {
            const isSelected = selectedSeats.find(s => s.seat_id === seat.seat_id);
            const status = isSelected ? 'selected' : seat.status;
            return (
              <button
                key={seat.seat_id}
                className={`seat ${status}`}
                onClick={() => handleSeatClick(seat)}
                disabled={status === 'booked'}
              >
                {seat.seat_number}
              </button>
            );
          })}
        </div>
      </div>

      <div className="seat-legend">
        <span><span className="dot available"></span> Available</span>
        <span><span className="dot selected"></span> Selected</span>
        <span><span className="dot held"></span> Held</span>
        <span><span className="dot booked"></span> Booked</span>
      </div>
    </div>
  );
};

export default SeatSelection;