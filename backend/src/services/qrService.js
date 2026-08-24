const QRCode = require('qrcode');
const { Booking } = require('../models/Booking');

class QRService {
  static async generateQRCode(bookingId) {
    try {
      const booking = await Booking.findByPk(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }
      
      const qrData = {
        bookingReference: booking.booking_reference,
        eventId: booking.event_id,
        userId: booking.user_id,
        timestamp: new Date().toISOString()
      };
      
      const qrString = JSON.stringify(qrData);
      const qrCode = await QRCode.toDataURL(qrString);
      
      // Save QR code to booking
      booking.qr_code = qrCode;
      await booking.save();
      
      return qrCode;
    } catch (error) {
      console.error('QR Code generation failed:', error);
      throw error;
    }
  }
  
  static async verifyQRCode(qrData) {
    try {
      const parsed = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
      
      const booking = await Booking.findOne({
        where: {
          booking_reference: parsed.bookingReference
        }
      });
      
      if (!booking) {
        return { valid: false, message: 'Invalid booking reference' };
      }
      
      if (booking.status === 'cancelled') {
        return { valid: false, message: 'Booking has been cancelled' };
      }
      
      return {
        valid: true,
        booking: booking
      };
    } catch (error) {
      return { valid: false, message: 'Invalid QR code' };
    }
  }
}

module.exports = { QRService };