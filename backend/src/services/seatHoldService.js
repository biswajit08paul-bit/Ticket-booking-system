const { sequelize } = require('../config/database');
const { EventSeat } = require('../models/EventSeat');
const { Event } = require('../models/Event');
const { Seat } = require('../models/Seat');
const { Op } = require('sequelize');

class SeatHoldService {
  // Hold a seat for a user
  static async holdSeat(eventId, seatId, userId, holdDuration = 600000) { // 10 minutes default
    const transaction = await sequelize.transaction();
    
    try {
      // Check if event exists and is valid
      const event = await Event.findByPk(eventId, { transaction });
      if (!event) {
        throw new Error('Event not found');
      }
      
      if (event.status === 'cancelled' || event.status === 'completed') {
        throw new Error('Event is no longer available');
      }
      
      // Find the event seat
      const eventSeat = await EventSeat.findOne({
        where: {
          event_id: eventId,
          seat_id: seatId
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      
      if (!eventSeat) {
        throw new Error('Seat not found for this event');
      }
      
      // Check if seat is available
      if (eventSeat.status === 'booked') {
        throw new Error('Seat is already booked');
      }
      
      if (eventSeat.status === 'held' && eventSeat.held_by !== userId) {
        // Check if hold has expired
        if (eventSeat.hold_expires_at && new Date() < new Date(eventSeat.hold_expires_at)) {
          throw new Error('Seat is currently held by another user');
        }
      }
      
      // Update seat status
      const holdExpiry = new Date(Date.now() + holdDuration);
      eventSeat.status = 'held';
      eventSeat.held_by = userId;
      eventSeat.hold_expires_at = holdExpiry;
      await eventSeat.save({ transaction });
      
      // Send real-time update via Socket.io
      const io = require('../../server').io;
      if (io) {
        io.to(`event-${eventId}`).emit('seat-update', {
          seatId,
          status: 'held',
          userId
        });
      }
      
      await transaction.commit();
      
      return {
        success: true,
        message: 'Seat held successfully',
        holdExpiresAt: holdExpiry,
        seat: eventSeat
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  // Release a held seat
  static async releaseSeat(eventId, seatId, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      const eventSeat = await EventSeat.findOne({
        where: {
          event_id: eventId,
          seat_id: seatId
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      
      if (!eventSeat) {
        throw new Error('Seat not found');
      }
      
      if (eventSeat.status !== 'held' || eventSeat.held_by !== userId) {
        throw new Error('Cannot release this seat');
      }
      
      eventSeat.status = 'available';
      eventSeat.held_by = null;
      eventSeat.hold_expires_at = null;
      await eventSeat.save({ transaction });
      
      // Update event available seats count
      await Event.increment('available_seats', {
        by: 1,
        where: { event_id: eventId },
        transaction
      });
      
      // Send real-time update
      const io = require('../../server').io;
      if (io) {
        io.to(`event-${eventId}`).emit('seat-update', {
          seatId,
          status: 'available'
        });
      }
      
      await transaction.commit();
      
      return {
        success: true,
        message: 'Seat released successfully'
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  // Auto-release expired holds (run via cron)
  static async releaseExpiredHolds() {
    const transaction = await sequelize.transaction();
    
    try {
      const expiredSeats = await EventSeat.findAll({
        where: {
          status: 'held',
          hold_expires_at: {
            [Op.lt]: new Date()
          }
        },
        transaction
      });
      
      for (const eventSeat of expiredSeats) {
        eventSeat.status = 'available';
        eventSeat.held_by = null;
        eventSeat.hold_expires_at = null;
        await eventSeat.save({ transaction });
        
        // Update event available seats
        await Event.increment('available_seats', {
          by: 1,
          where: { event_id: eventSeat.event_id },
          transaction
        });
        
        // Notify via WebSocket
        const io = require('../../server').io;
        if (io) {
          io.to(`event-${eventSeat.event_id}`).emit('seat-update', {
            seatId: eventSeat.seat_id,
            status: 'available'
          });
        }
      }
      
      await transaction.commit();
      
      return {
        success: true,
        released: expiredSeats.length
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = { SeatHoldService };