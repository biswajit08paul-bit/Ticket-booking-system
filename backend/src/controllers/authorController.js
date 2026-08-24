const { Hall } = require('../models/Hall');
const { User } = require('../models/User');
const { Event } = require('../models/Event');
const { sequelize } = require('../config/database');

class AuthorController {
  // Get all malls owned by author
  static async getMalls(req, res, next) {
    try {
      const author_id = req.user.user_id;
      
      const halls = await Hall.findAll({
        where: { author_id },
        order: [['hall_group', 'ASC']]
      });
      
      // Group by hall_group to create "malls"
      const malls = halls.reduce((acc, hall) => {
        const group = hall.hall_group || 'Unassigned';
        if (!acc[group]) {
          acc[group] = {
            mall_id: `mall_${Date.now()}_${group}`,
            mall_name: `${group} Mall`,
            group: group,
            total_halls: 0,
            available_halls: 0,
            booked_halls: 0,
            revenue: 0,
            status: 'active',
            halls: []
          };
        }
        acc[group].total_halls++;
        if (hall.status === 'available') acc[group].available_halls++;
        if (hall.status === 'booked') acc[group].booked_halls++;
        acc[group].halls.push(hall);
        return acc;
      }, {});
      
      res.status(200).json({
        success: true,
        data: Object.values(malls)
      });
    } catch (error) {
      next(error);
    }
  }

  // Create a new mall (group of halls)
  static async createMall(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { mall_name, group, total_halls, price_per_hall, location } = req.body;
      const author_id = req.user.user_id;
      
      // Create multiple halls under one group
      const halls = [];
      for (let i = 1; i <= total_halls; i++) {
        halls.push({
          hall_name: `${mall_name} Hall ${i}`,
          hall_group: group,
          author_id,
          total_seats: 100,
          available_seats: 100,
          price_per_seat: price_per_hall || 100,
          status: 'available',
          location: location || 'N/A'
        });
      }
      
      const createdHalls = await Hall.bulkCreate(halls, { transaction });
      
      await transaction.commit();
      
      const io = req.app.get('io');
      if (io) {
        io.emit('mall-update', {
          mall_name,
          group,
          total_halls: createdHalls.length,
          status: 'created'
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Mall created successfully',
        data: createdHalls
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  // Update mall price
  static async updateMallPrice(req, res, next) {
    try {
      const { mall_id } = req.params;
      const { price_per_hall } = req.body;
      const author_id = req.user.user_id;
      
      // Find all halls in this group
      const halls = await Hall.findAll({
        where: { 
          author_id,
          hall_group: mall_id
        }
      });
      
      if (halls.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mall not found'
        });
      }
      
      // Update price for all halls in the group
      await Hall.update(
        { price_per_seat: price_per_hall },
        { where: { hall_group: mall_id, author_id } }
      );
      
      res.status(200).json({
        success: true,
        message: 'Price updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all managers
  static async getManagers(req, res, next) {
    try {
      const managers = await User.findAll({
        where: { user_type: 'manager' },
        attributes: ['user_id', 'full_name', 'email', 'phone_number', 'registration_code', 'is_active']
      });
      
      // Get hall count for each manager
      const managerData = await Promise.all(managers.map(async (manager) => {
        const hallCount = await Hall.count({
          where: { manager_id: manager.user_id }
        });
        return {
          ...manager.toJSON(),
          hall_count: hallCount
        };
      }));
      
      res.status(200).json({
        success: true,
        data: managerData
      });
    } catch (error) {
      next(error);
    }
  }

  // Get author stats
  static async getStats(req, res, next) {
    try {
      const author_id = req.user.user_id;
      
      const totalHalls = await Hall.count({ where: { author_id } });
      const bookedHalls = await Hall.count({ 
        where: { author_id, status: 'booked' } 
      });
      const availableHalls = await Hall.count({
        where: { author_id, status: 'available' }
      });
      
      // Get total revenue from events
      const events = await Event.findAll({
        where: { author_id }
      });
      
      const totalRevenue = events.reduce((sum, e) => sum + parseFloat(e.revenue || 0), 0);
      const bookingsThisMonth = events.filter(e => {
        const date = new Date(e.created_at || e.date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length;
      
      res.status(200).json({
        success: true,
        data: {
          totalMalls: totalHalls,
          activeManagers: await User.count({ 
            where: { user_type: 'manager', is_active: true }
          }),
          totalRevenue,
          bookingsThisMonth,
          bookedHalls,
          availableHalls
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get author revenue
  static async getRevenue(req, res, next) {
    try {
      const author_id = req.user.user_id;
      
      const events = await Event.findAll({
        where: { author_id },
        attributes: ['event_id', 'title', 'revenue', 'total_seats', 'available_seats', 'date']
      });
      
      const totalRevenue = events.reduce((sum, e) => sum + parseFloat(e.revenue || 0), 0);
      
      // Group by month
      const monthlyRevenue = events.reduce((acc, event) => {
        const month = new Date(event.date).toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!acc[month]) acc[month] = 0;
        acc[month] += parseFloat(event.revenue || 0);
        return acc;
      }, {});
      
      res.status(200).json({
        success: true,
        data: {
          total: totalRevenue,
          monthly: monthlyRevenue,
          events: events
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Approve manager request
  static async approveManager(req, res, next) {
    try {
      const { request_id, hall_id } = req.body;
      const author_id = req.user.user_id;
      
      const hall = await Hall.findOne({
        where: { hall_id, author_id }
      });
      
      if (!hall) {
        return res.status(404).json({
          success: false,
          message: 'Hall not found or not owned by you'
        });
      }
      
      // In real implementation, you'd have a Request model
      // For now, just update hall status
      
      const io = req.app.get('io');
      if (io) {
        io.emit('manager-approved', {
          hall_id: hall.hall_id,
          hall_name: hall.hall_name,
          status: 'available_for_booking'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Manager approved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { AuthorController };