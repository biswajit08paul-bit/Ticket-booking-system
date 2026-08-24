const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Hall = sequelize.define('Hall', {
  hall_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  hall_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  hall_group: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  author_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  manager_id: {
    type: DataTypes.UUID,
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
  price_per_seat: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  booking_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('available', 'booked', 'maintenance'),
    defaultValue: 'available'
  },
  booked_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_live: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true
  }
}, {
  tableName: 'halls',
  timestamps: true
});

module.exports = { Hall };