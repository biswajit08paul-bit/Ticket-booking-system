const { Venue } = require('../models/Venue');
const { Seat } = require('../models/Seat');
const { User } = require('../models/User');
const { Event } = require('../models/Event');
const { Booking } = require('../models/Booking');
const { sequelize } = require('../config/database');

class AdminController {
  // Create venue
  static async createVenue(req, res, next) {
    try {
      const {
        venue_name,
        location,
        address,
        total_seats,
        rows,
        columns
      } = req.body;
      
      const venue = await Venue.create({
        venue_name,
        location,
        address,
        total_seats,
        rows,
        columns,
        status: 'active'
      });
      
      // Create seats for the venue
      const seats = [];
      const categories = ['premium', 'standard', 'standard', 'economy'];
      const multipliers = [1.5, 1.0, 1.0, 0.8];
      
      for (let row = 0; row < rows; row++) {
        const rowLetter = String.fromCharCode(65 + row);
        for (let col = 1; col <= columns; col++) {
          const seatNumber = col;
          const categoryIndex = (row + col) % categories.length;
          
          seats.push({
            venue_id: venue.venue_id,
            row: rowLetter,
            seat_number: seatNumber,
            category: categories[categoryIndex],
            price_multiplier: multipliers[categoryIndex]
          });
        }
      }
      
      await Seat.bulkCreate(seats);
      
      res.status(201).json({
        success: true,
        message: 'Venue created successfully',
        data: venue
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get all venues
  static async getVenues(req, res, next) {
    try {
      const venues = await Venue.findAll({
        include: [
          { model: Seat, attributes: ['seat_id', 'row', 'seat_number', 'category'] }
        ],
        order: [['venue_name', 'ASC']]
      });
      
      res.status(200).json({
        success: true,
        count: venues.length,
        data: venues
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Update venue
  static async updateVenue(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const venue = await Venue.findByPk(id);
      if (!venue) {
        return res.status(404).json({
          success: false,
          message: 'Venue not found'
        });
      }
      
      await venue.update(updates);
      
      res.status(200).json({
        success: true,
        message: 'Venue updated successfully',
        data: venue
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Delete venue
  static async deleteVenue(req, res, next) {
    try {
      const { id } = req.params;
      
      const venue = await Venue.findByPk(id);
      if (!venue) {
        return res.status(404).json({
          success: false,
          message: 'Venue not found'
        });
      }
      
      // Check if venue has events
      const events = await Event.count({
        where: { venue_id: id }
      });
      
      if (events > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete venue with existing events'
        });
      }
      
      await venue.destroy();
      
      res.status(200).json({
        success: true,
        message: 'Venue deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get all users (admin only)
  static async getUsers(req, res, next) {
    try {
      const { user_type, is_verified } = req.query;
      
      const where = {};
      if (user_type) where.user_type = user_type;
      if (is_verified !== undefined) where.is_verified = is_verified === 'true';
      
      const users = await User.findAll({
        where,
        attributes: { exclude: ['password_hash', 'otp_code'] },
        order: [['created_at', 'DESC']]
      });
      
      res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get system stats
  static async getSystemStats(req, res, next) {
    try {
      const totalUsers = await User.count();
      const totalEvents = await Event.count();
      const totalBookings = await Booking.count();
      const totalVenues = await Venue.count();
      
      const confirmedBookings = await Booking.count({
        where: { status: 'confirmed' }
      });
      
      const totalRevenue = await Booking.sum('total_amount', {
        where: { status: 'confirmed' }
      });
      
      res.status(200).json({
        success: true,
        data: {
          users: totalUsers,
          events: totalEvents,
          bookings: totalBookings,
          confirmedBookings,
          venues: totalVenues,
          revenue: totalRevenue || 0
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Toggle user status
  static async toggleUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      user.is_active = !user.is_active;
      await user.save();
      
      res.status(200).json({
        success: true,
        message: `User ${user.is_active ? 'activated' : 'deactivated'}`,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { AdminController };