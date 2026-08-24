// associations.js - Add this to define relationships
const { User } = require('./User');
const { Event } = require('./Event');
const { Venue } = require('./Venue');
const { Seat } = require('./Seat');
const { EventSeat } = require('./EventSeat');
const { Booking } = require('./Booking');
const { BookingSeat } = require('./BookingSeat');
const { Waitlist } = require('./Waitlist');

// User - Booking
User.hasMany(Booking, { foreignKey: 'user_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

// User - Waitlist
User.hasMany(Waitlist, { foreignKey: 'user_id' });
Waitlist.belongsTo(User, { foreignKey: 'user_id' });

// Event - Booking
Event.hasMany(Booking, { foreignKey: 'event_id' });
Booking.belongsTo(Event, { foreignKey: 'event_id' });

// Event - EventSeat
Event.hasMany(EventSeat, { foreignKey: 'event_id' });
EventSeat.belongsTo(Event, { foreignKey: 'event_id' });

// Event - Waitlist
Event.hasMany(Waitlist, { foreignKey: 'event_id' });
Waitlist.belongsTo(Event, { foreignKey: 'event_id' });

// Venue - Event
Venue.hasMany(Event, { foreignKey: 'venue_id' });
Event.belongsTo(Venue, { foreignKey: 'venue_id' });

// Venue - Seat
Venue.hasMany(Seat, { foreignKey: 'venue_id' });
Seat.belongsTo(Venue, { foreignKey: 'venue_id' });

// Seat - EventSeat
Seat.hasMany(EventSeat, { foreignKey: 'seat_id' });
EventSeat.belongsTo(Seat, { foreignKey: 'seat_id' });

// Booking - BookingSeat
Booking.hasMany(BookingSeat, { foreignKey: 'booking_id' });
BookingSeat.belongsTo(Booking, { foreignKey: 'booking_id' });

// EventSeat - BookingSeat
EventSeat.hasOne(BookingSeat, { foreignKey: 'event_seat_id' });
BookingSeat.belongsTo(EventSeat, { foreignKey: 'event_seat_id' });