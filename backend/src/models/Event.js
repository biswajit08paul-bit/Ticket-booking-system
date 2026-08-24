const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
  event_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  hall_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  manager_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  author_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  poster_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('movie', 'concert', 'drama', 'sports', 'live'),
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  total_seats: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  available_seats: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ticket_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'live', 'completed', 'cancelled'),
    defaultValue: 'upcoming'
  },
  is_live_now: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'events'
});


module.exports = { Event };