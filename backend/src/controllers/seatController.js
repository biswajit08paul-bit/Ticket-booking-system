const { SeatHoldService } = require('../services/seatHoldService');
const { EventSeat } = require('../models/EventSeat');
const { Seat } = require('../models/Seat');

class SeatController {
  // Hold a seat
  static async holdSeat(req, res, next) {
    try {
      const { event_id, seat_id } = req.body;
      const user_id = req.user.user_id;
      
      const result = await SeatHoldService.holdSeat(event_id, seat_id, user_id);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Release a seat
  static async releaseSeat(req, res, next) {
    try {
      const { event_id, seat_id } = req.body;
      const user_id = req.user.user_id;
      
      const result = await SeatHoldService.releaseSeat(event_id, seat_id, user_id);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get seats for event
  static async getEventSeats(req, res, next) {
    try {
      const { eventId } = req.params;
      
      const eventSeats = await EventSeat.findAll({
        where: { event_id: eventId },
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
        count: eventSeats.length,
        data: eventSeats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { SeatController };