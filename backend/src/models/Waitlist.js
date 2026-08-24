const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Waitlist = sequelize.define('Waitlist', {
  waitlist_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  seat_category: {
    type: DataTypes.ENUM('premium', 'standard', 'economy', 'vip'),
    allowNull: false
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('waiting', 'offered', 'expired', 'fulfilled'),
    defaultValue: 'waiting'
  },
  offer_expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'waitlist',
  indexes: [
    {
      unique: true,
      fields: ['event_id', 'user_id', 'seat_category']
    }
  ]
});

module.exports = { Waitlist };