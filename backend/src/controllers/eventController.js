const { Event } = require('../models/Event');
const { Venue } = require('../models/Venue');
const { Seat } = require('../models/Seat');
const { EventSeat } = require('../models/EventSeat');
const { Op } = require('sequelize');

class EventController {
  
  // ✅ GET ALL EVENTS - FIXED (Only one getEvents method)
  static async getEvents(req, res, next) {
    try {
      console.log('📡 Fetching events...');
      
      const events = await Event.findAll({
        order: [['date', 'ASC'], ['time', 'ASC']]
      });
      
      console.log(`✅ Found ${events.length} events`);
      
      res.status(200).json({
        success: true,
        count: events.length,
        data: events
      });
    } catch (error) {
      console.error('❌ Get events error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
        error: error.message
      });
    }
  }
  
  // ✅ GET SINGLE EVENT
  static async getEvent(req, res, next) {
    try {
      const { id } = req.params;
      
      const event = await Event.findByPk(id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: event
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ✅ CREATE EVENT
  static async createEvent(req, res, next) {
    try {
      const {
        title,
        event_type,
        description,
        date,
        time,
        end_date,
        venue_id,
        base_price,
        max_seats
      } = req.body;
      
      // Check if venue exists
      const venue = await Venue.findByPk(venue_id);
      if (!venue) {
        return res.status(404).json({
          success: false,
          message: 'Venue not found'
        });
      }
      
      // Create event
      const event = await Event.create({
        title,
        event_type,
        description,
        date,
        time,
        end_date,
        venue_id,
        organiser_id: req.user.user_id,
        base_price,
        max_seats,
        available_seats: max_seats,
        status: 'upcoming'
      });
      
      // Create event seats based on venue seats
      const venueSeats = await Seat.findAll({
        where: { venue_id }
      });
      
      for (const seat of venueSeats) {
        await EventSeat.create({
          event_id: event.event_id,
          seat_id: seat.seat_id,
          price: base_price * (seat.price_multiplier || 1),
          status: 'available'
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ✅ UPDATE EVENT
  static async updateEvent(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const event = await Event.findByPk(id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      
      // Check if user owns this event
      if (event.organiser_id !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this event'
        });
      }
      
      await event.update(updates);
      
      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: event
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ✅ GET EVENT SEATS
  static async getEventSeats(req, res, next) {
    try {
      const { id } = req.params;
      
      const event = await Event.findByPk(id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      
      const seats = await EventSeat.findAll({
        where: { event_id: id },
        include: [
          { model: Seat, attributes: ['row', 'seat_number', 'category'] }
        ],
        order: [
          [{ model: Seat }, 'row', 'ASC'],
          [{ model: Seat }, 'seat_number', 'ASC']
        ]
      });
      
      res.status(200).json({
        success: true,
        count: seats.length,
        data: seats
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ✅ GET ORGANIZER'S EVENTS
  static async getOrganizerEvents(req, res, next) {
    try {
      const events = await Event.findAll({
        where: { organiser_id: req.user.user_id },
        order: [['date', 'DESC']]
      });
      
      res.status(200).json({
        success: true,
        count: events.length,
        data: events
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ✅ GET EVENT SUMMARY
  static async getEventSummary(req, res, next) {
    try {
      const { id } = req.params;
      
      const event = await Event.findByPk(id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      
      // Check ownership
      if (event.organiser_id !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }
      
      res.status(200).json({
        success: true,
        data: {
          event: event,
          stats: {
            totalBookings: 0,
            totalSeatsBooked: 0,
            availableSeats: event.available_seats,
            soldOut: event.is_sold_out || false
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { EventController };