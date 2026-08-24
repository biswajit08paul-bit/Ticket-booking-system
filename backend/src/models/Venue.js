const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Venue = sequelize.define('Venue', {
  venue_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  venue_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total_seats: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rows: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  columns: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
    defaultValue: 'active'
  }
}, {
  tableName: 'venues'
});

module.exports = { Venue };