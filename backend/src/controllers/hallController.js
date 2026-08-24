const { Hall } = require('../models/Hall');
const { Event } = require('../models/Event');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

class HallController {
  // Get all halls for a manager
  static async getManagerHalls(req, res, next) {
    try {
      const manager_id = req.user.user_id;
      
      const halls = await Hall.findAll({
        where: {
          [Op.or]: [
            { manager_id },
            { status: 'available' }
          ]
        },
        order: [['hall_group', 'ASC']]
      });
      
      res.status(200).json({
        success: true,
        count: halls.length,
        data: halls
      });
    } catch (error) {
      next(error);
    }
  }

  // Book a hall
  static async bookHall(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { hall_id, duration_days = 30 } = req.body;
      const manager_id = req.user.user_id;
      
      const hall = await Hall.findByPk(hall_id, { transaction });
      
      if (!hall) {
        return res.status(404).json({
          success: false,
          message: 'Hall not found'
        });
      }
      
      if (hall.status === 'booked') {
        return res.status(400).json({
          success: false,
          message: 'Hall is already booked'
        });
      }
      
      const bookedUntil = new Date();
      bookedUntil.setDate(bookedUntil.getDate() + duration_days);
      
      hall.status = 'booked';
      hall.manager_id = manager_id;
      hall.booked_until = bookedUntil;
      hall.booking_price = hall.price_per_seat * hall.total_seats;
      
      await hall.save({ transaction });
      
      // Get socket.io instance
      const io = req.app.get('io');
      if (io) {
        io.emit('hall-update', {
          hall_id: hall.hall_id,
          hall_name: hall.hall_name,
          status: 'booked',
          manager_id: manager_id,
          booked_until: bookedUntil
        });
      }
      
      await transaction.commit();
      
      res.status(200).json({
        success: true,
        message: 'Hall booked successfully',
        data: hall
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  // Release a hall
  static async releaseHall(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { hall_id } = req.params;
      const manager_id = req.user.user_id;
      
      const hall = await Hall.findByPk(hall_id, { transaction });
      
      if (!hall) {
        return res.status(404).json({
          success: false,
          message: 'Hall not found'
        });
      }
      
      if (hall.manager_id !== manager_id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to release this hall'
        });
      }
      
      hall.status = 'available';
      hall.manager_id = null;
      hall.booked_until = null;
      hall.booking_price = null;
      
      await hall.save({ transaction });
      
      const io = req.app.get('io');
      if (io) {
        io.emit('hall-update', {
          hall_id: hall.hall_id,
          hall_name: hall.hall_name,
          status: 'available'
        });
      }
      
      await transaction.commit();
      
      res.status(200).json({
        success: true,
        message: 'Hall released successfully',
        data: hall
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  // Get hall groups
  static async getHallGroups(req, res, next) {
    try {
      const halls = await Hall.findAll({
        attributes: ['hall_group', 'status', 'hall_id', 'hall_name']
      });
      
      const groups = halls.reduce((acc, hall) => {
        const group = hall.hall_group || 'Unassigned';
        if (!acc[group]) {
          acc[group] = {
            group_name: group,
            total: 0,
            available: 0,
            booked: 0
          };
        }
        acc[group].total++;
        if (hall.status === 'available') acc[group].available++;
        if (hall.status === 'booked') acc[group].booked++;
        return acc;
      }, {});
      
      res.status(200).json({
        success: true,
        data: Object.values(groups)
      });
    } catch (error) {
      next(error);
    }
  }

  // Get hall details
  static async getHallDetails(req, res, next) {
    try {
      const { hall_id } = req.params;
      
      const hall = await Hall.findByPk(hall_id);
      
      if (!hall) {
        return res.status(404).json({
          success: false,
          message: 'Hall not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: hall
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { HallController };