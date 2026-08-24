const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Seat = sequelize.define('Seat', {
  seat_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  venue_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  row: {
    type: DataTypes.STRING(5),
    allowNull: false
  },
  seat_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('premium', 'standard', 'economy', 'vip'),
    defaultValue: 'standard'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  price_multiplier: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.00
  }
}, {
  tableName: 'seats',
  indexes: [
    {
      unique: true,
      fields: ['venue_id', 'row', 'seat_number']
    }
  ]
});

module.exports = { Seat };