const { WaitlistService } = require('../services/waitlistService');
const { Waitlist } = require('../models/Waitlist');
const { Event } = require('../models/Event');

class WaitlistController {
  // Join waitlist
  static async joinWaitlist(req, res, next) {
    try {
      const { event_id, seat_category } = req.body;
      const user_id = req.user.user_id;
      
      const result = await WaitlistService.joinWaitlist(event_id, user_id, seat_category);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get waitlist status for an event
  static async getWaitlistStatus(req, res, next) {
    try {
      const { eventId } = req.params;
      
      const waitlist = await Waitlist.findAll({
        where: {
          event_id: eventId,
          status: 'waiting'
        },
        order: [['position', 'ASC']],
        attributes: ['waitlist_id', 'position', 'seat_category', 'joined_at']
      });
      
      const event = await Event.findByPk(eventId);
      
      res.status(200).json({
        success: true,
        data: {
          event: event.title,
          totalWaiting: waitlist.length,
          waitlist
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get user's position in waitlist
  static async getPosition(req, res, next) {
    try {
      const { eventId } = req.params;
      const user_id = req.user.user_id;
      
      const entry = await Waitlist.findOne({
        where: {
          event_id: eventId,
          user_id,
          status: 'waiting'
        }
      });
      
      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Not in waitlist'
        });
      }
      
      res.status(200).json({
        success: true,
        data: {
          position: entry.position,
          seat_category: entry.seat_category,
          joined_at: entry.joined_at
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { WaitlistController };