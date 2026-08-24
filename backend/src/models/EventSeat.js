const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EventSeat = sequelize.define('EventSeat', {
  event_seat_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  seat_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'held', 'booked'),
    defaultValue: 'available'
  },
  hold_expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  held_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'event_seats',
  indexes: [
    {
      unique: true,
      fields: ['event_id', 'seat_id']
    }
  ]
});

module.exports = { EventSeat };