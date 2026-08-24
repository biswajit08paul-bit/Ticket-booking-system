const { Booking } = require('../models/Booking');
const { BookingSeat } = require('../models/BookingSeat');
const { Event } = require('../models/Event');
const { EventSeat } = require('../models/EventSeat');
const { Seat } = require('../models/Seat');
const { QRService } = require('../services/qrService');
const { CodeGenerator } = require('../utils/generateCode');
const { sendEmail } = require('../config/email');
const { sequelize } = require('../config/database');

class BookingController {
  // Create booking
  static async createBooking(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { event_id, seat_ids, total_amount } = req.body;
      const user_id = req.user.user_id;
      
      // Check event
      const event = await Event.findByPk(event_id, { transaction });
      if (!event) {
        throw new Error('Event not found');
      }
      
      if (event.status === 'cancelled' || event.status === 'completed') {
        throw new Error('Event is no longer available');
      }
      
      // Check and lock seats
      const eventSeats = await EventSeat.findAll({
        where: {
          event_id,
          seat_id: seat_ids
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      
      if (eventSeats.length !== seat_ids.length) {
        throw new Error('Some seats not found');
      }
      
      // Verify all seats are held by this user
      for (const es of eventSeats) {
        if (es.status !== 'held' || es.held_by !== user_id) {
          throw new Error(`Seat ${es.seat_id} is not held by you`);
        }
        
        if (es.hold_expires_at && new Date() > new Date(es.hold_expires_at)) {
          throw new Error(`Seat ${es.seat_id} hold has expired`);
        }
      }
      
      // Generate booking reference
      const bookingRef = CodeGenerator.generateBookingReference();
      
      // Create booking
      const booking = await Booking.create({
        booking_reference: bookingRef,
        user_id,
        event_id,
        total_amount,
        status: 'confirmed',
        payment_status: 'paid',
        booking_date: new Date()
      }, { transaction });
      
      // Create booking seats and update event seats
      for (const es of eventSeats) {
        await BookingSeat.create({
          booking_id: booking.booking_id,
          event_seat_id: es.event_seat_id,
          seat_id: es.seat_id,
          price: es.price
        }, { transaction });
        
        es.status = 'booked';
        es.held_by = null;
        es.hold_expires_at = null;
        await es.save({ transaction });
        
        // Update available seats count
        await Event.decrement('available_seats', {
          by: 1,
          where: { event_id },
          transaction
        });
      }
      
      // Check if event is sold out
      const remainingSeats = await EventSeat.count({
        where: {
          event_id,
          status: 'available'
        },
        transaction
      });
      
      if (remainingSeats === 0) {
        await Event.update(
          { is_sold_out: true },
          { where: { event_id }, transaction }
        );
      }
      
      // Generate QR code
      const qrCode = await QRService.generateQRCode(booking.booking_id);
      
      await transaction.commit();
      
      // Send confirmation email
      await BookingController.sendBookingConfirmation(booking, event, qrCode);
      
      // Send real-time update
      const io = req.app.get('io');
      if (io) {
        for (const es of eventSeats) {
          io.to(`event-${event_id}`).emit('seat-update', {
            seatId: es.seat_id,
            status: 'booked'
          });
        }
      }
      
      res.status(201).json({
        success: true,
        message: 'Booking confirmed successfully',
        data: {
          booking,
          qr_code: qrCode
        }
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
  
  // Get user bookings
  static async getUserBookings(req, res, next) {
    try {
      const bookings = await Booking.findAll({
        where: { user_id: req.user.user_id },
        include: [
          { model: Event, attributes: ['title', 'date', 'time', 'event_type'] },
          { model: BookingSeat, include: [{ model: Seat, attributes: ['row', 'seat_number', 'category'] }] }
        ],
        order: [['booking_date', 'DESC']]
      });
      
      res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get single booking
  static async getBooking(req, res, next) {
    try {
      const { id } = req.params;
      
      const booking = await Booking.findByPk(id, {
        include: [
          { model: Event, attributes: ['title', 'date', 'time', 'venue_id'] },
          { model: BookingSeat, include: [{ model: Seat, attributes: ['row', 'seat_number', 'category'] }] }
        ]
      });
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      
      // Check ownership
      if (booking.user_id !== req.user.user_id && req.user.user_type !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }
      
      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Cancel booking
  static async cancelBooking(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      
      const booking = await Booking.findByPk(id, { transaction });
      if (!booking) {
        throw new Error('Booking not found');
      }
      
      // Check ownership
      if (booking.user_id !== req.user.user_id && req.user.user_type !== 'admin') {
        throw new Error('Not authorized');
      }
      
      if (booking.status === 'cancelled') {
        throw new Error('Booking already cancelled');
      }
      
      // Update booking
      booking.status = 'cancelled';
      await booking.save({ transaction });
      
      // Release seats
      const bookingSeats = await BookingSeat.findAll({
        where: { booking_id: id },
        transaction
      });
      
      for (const bs of bookingSeats) {
        const eventSeat = await EventSeat.findByPk(bs.event_seat_id, { transaction });
        if (eventSeat) {
          eventSeat.status = 'available';
          eventSeat.held_by = null;
          eventSeat.hold_expires_at = null;
          await eventSeat.save({ transaction });
        }
        
        // Update available seats
        await Event.increment('available_seats', {
          by: 1,
          where: { event_id: booking.event_id },
          transaction
        });
      }
      
      // Update sold out status
      await Event.update(
        { is_sold_out: false },
        { where: { event_id: booking.event_id }, transaction }
      );
      
      await transaction.commit();
      
      // Process waitlist
      const { WaitlistService } = require('../services/waitlistService');
      if (bookingSeats.length > 0) {
        const firstSeat = bookingSeats[0];
        const eventSeat = await EventSeat.findByPk(firstSeat.event_seat_id);
        const seat = await Seat.findByPk(eventSeat.seat_id);
        if (seat) {
          await WaitlistService.processCancellation(booking.event_id, seat.category, seat.seat_id);
        }
      }
      
      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
  
  // Send booking confirmation email
  static async sendBookingConfirmation(booking, event, qrCode) {
    try {
      const user = await User.findByPk(booking.user_id);
      
      const emailHtml = `
        <h2>🎫 Booking Confirmation</h2>
        <p>Dear ${user.full_name},</p>
        <p>Your booking has been confirmed!</p>
        <hr>
        <h3>Booking Details:</h3>
        <p><strong>Reference:</strong> ${booking.booking_reference}</p>
        <p><strong>Event:</strong> ${event.title}</p>
        <p><strong>Date:</strong> ${event.date}</p>
        <p><strong>Time:</strong> ${event.time}</p>
        <p><strong>Total Amount:</strong> ₹${booking.total_amount}</p>
        <hr>
        <p>Your QR code ticket is attached below.</p>
        <p>Please present this at the venue.</p>
        <p>Thank you for choosing us!</p>
      `;
      
      // Convert base64 QR to buffer attachment
      const qrBuffer = Buffer.from(qrCode.split(',')[1], 'base64');
      
      await sendEmail(
        user.email,
        `Booking Confirmation - ${booking.booking_reference}`,
        emailHtml,
        [{
          filename: `ticket-${booking.booking_reference}.png`,
          content: qrBuffer,
          encoding: 'base64'
        }]
      );
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      // Don't throw - booking is already confirmed
    }
  }
}

module.exports = { BookingController };