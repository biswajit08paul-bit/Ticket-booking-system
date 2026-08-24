const { sequelize } = require('../config/database');
const { Waitlist } = require('../models/Waitlist');
const { User } = require('../models/User');
const { Event } = require('../models/Event');
const { sendEmail } = require('../config/email');
const { Op } = require('sequelize');  // ← ADD THIS LINE


class WaitlistService {
  static async joinWaitlist(eventId, userId, seatCategory) {
    const transaction = await sequelize.transaction();
    
    try {
      const event = await Event.findByPk(eventId, { transaction });
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Check if already in waitlist
      const existing = await Waitlist.findOne({
        where: {
          event_id: eventId,
          user_id: userId,
          seat_category: seatCategory,
          status: 'waiting'
        },
        transaction
      });
      
      if (existing) {
        throw new Error('Already in waitlist for this category');
      }
      
      // Get current max position
      const maxPosition = await Waitlist.max('position', {
        where: {
          event_id: eventId,
          seat_category: seatCategory,
          status: 'waiting'
        },
        transaction
      });
      
      const position = (maxPosition || 0) + 1;
      
      const waitlistEntry = await Waitlist.create({
        event_id: eventId,
        user_id: userId,
        seat_category: seatCategory,
        position
      }, { transaction });
      
      await transaction.commit();
      
      return {
        success: true,
        message: 'Added to waitlist',
        position,
        waitlistEntry
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  static async processCancellation(eventId, seatCategory, seatId) {
    const transaction = await sequelize.transaction();
    
    try {
      // Get first waiting user
      const nextInLine = await Waitlist.findOne({
        where: {
          event_id: eventId,
          seat_category: seatCategory,
          status: 'waiting'
        },
        order: [['position', 'ASC']],
        transaction
      });
      
      if (!nextInLine) {
        return { success: false, message: 'No one in waitlist' };
      }
      
      // Update waitlist status
      nextInLine.status = 'offered';
      const offerExpiry = new Date(Date.now() + 3600000); // 1 hour
      nextInLine.offer_expires_at = offerExpiry;
      await nextInLine.save({ transaction });
      
      // Get user details
      const user = await User.findByPk(nextInLine.user_id, { transaction });
      
      // Send email notification
      const emailHtml = `
        <h2>Seat Offer Available!</h2>
        <p>Dear ${user.full_name},</p>
        <p>A ${seatCategory} seat has become available for the event.</p>
        <p>You have 1 hour to complete your booking.</p>
        <a href="${process.env.FRONTEND_URL}/book/${eventId}?offer=${nextInLine.waitlist_id}">
          Book Now
        </a>
        <p>This offer expires at: ${offerExpiry}</p>
      `;
      
      await sendEmail(user.email, 'Seat Offer Available', emailHtml);
      
      await transaction.commit();
      
      return {
        success: true,
        message: 'Waitlist user notified',
        user: user.full_name,
        offerExpiresAt: offerExpiry
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  static async expireOffers() {
    const transaction = await sequelize.transaction();
    
    try {
      const expiredOffers = await Waitlist.findAll({
        where: {
          status: 'offered',
          offer_expires_at: {
            [Op.lt]: new Date()
          }
        },
        transaction
      });
      
      for (const offer of expiredOffers) {
        offer.status = 'expired';
        await offer.save({ transaction });
        
        // Notify user
        const user = await User.findByPk(offer.user_id, { transaction });
        if (user) {
          await sendEmail(
            user.email,
            'Offer Expired',
            `<p>Your seat offer has expired. You can join the waitlist again.</p>`
          );
        }
      }
      
      await transaction.commit();
      
      return {
        success: true,
        expired: expiredOffers.length
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = { WaitlistService };