const { User } = require('../models/User');
const { generateToken } = require('../config/jwt');
const { OTPService } = require('../utils/otpService');
const { CodeGenerator } = require('../utils/generateCode');
const { Op } = require('sequelize');

class AuthController {
  // Register new user - SIMPLIFIED & FIXED
  static async register(req, res, next) {
    try {
      console.log('📝 Registration request received:', req.body);
      
      const {
        full_name,
        email,
        phone_number,
        date_of_birth,
        password,
        user_type = 'user',
        company_name,
        address
      } = req.body;
      
      // VALIDATION - Check all required fields
      if (!full_name || !email || !phone_number || !date_of_birth || !password) {
        return res.status(400).json({
          success: false,
          message: '❌ All fields are required: full_name, email, phone_number, date_of_birth, password'
        });
      }
      
      // Check if email already exists for this user_type
      const existingEmail = await User.findOne({
        where: {
          email: email,
          user_type: user_type
        }
      });
      
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: `❌ Email "${email}" is already registered as ${user_type}. Please login.`
        });
      }
      
      // Check if phone number already exists for this user_type
      const existingPhone = await User.findOne({
        where: {
          phone_number: phone_number,
          user_type: user_type
        }
      });
      
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: `❌ Phone number "${phone_number}" is already registered as ${user_type}.`
        });
      }
      
      // Create user
      const user = await User.create({
        full_name,
        email,
        phone_number,
        date_of_birth,
        password_hash: password,
        user_type: user_type || 'user',
        company_name: user_type === 'manager' ? company_name : null,
        address: (user_type === 'manager' || user_type === 'admin') ? address : null,
        is_verified: false,
        is_active: true
      });
      
      // Generate registration code for manager/admin
      if (user_type === 'manager') {
        user.registration_code = await CodeGenerator.generateManagerCode();
        await user.save();
      } else if (user_type === 'admin') {
        user.registration_code = await CodeGenerator.generateAdminCode();
        await user.save();
      }
      
      // Generate OTP
      const otp = OTPService.generateOTP();
      const otpExpiry = new Date(Date.now() + 600000);
      user.otp_code = otp;
      user.otp_expires_at = otpExpiry;
      await user.save();
      
      // Send OTP (don't fail registration if email fails)
      try {
        await OTPService.sendOTP(phone_number, email, otp);
        console.log('✅ OTP sent successfully');
      } catch (emailError) {
        console.log('⚠️ OTP email failed but registration continues:', emailError.message);
        // Continue - user can resend OTP
      }
      
      // Generate token
      const token = generateToken({
        user_id: user.user_id,
        user_type: user.user_type
      });
      
      console.log('✅ User registered successfully:', user.user_id);
      
      res.status(201).json({
        success: true,
        message: '✅ Registration successful! Please verify OTP sent to your email.',
        data: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          phone_number: user.phone_number,
          user_type: user.user_type,
          registration_code: user.registration_code || null,
          is_verified: user.is_verified,
          requires_otp: true,
          token
        }
      });
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Handle database unique constraint errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: '❌ Duplicate entry. Email or phone already exists.'
        });
      }
      
      // Handle validation errors
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(e => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: `❌ Validation error: ${messages}`
        });
      }
      
      next(error);
    }
  }
  
  // Login user
  static async login(req, res, next) {
    try {
      console.log('🔑 Login request:', req.body.email, req.body.user_type);
      
      const { email, password, user_type } = req.body;

      // if (!email || !password || !user_type) {
      //   return res.status(400).json({
      //     success: false,
      //     message: '❌ Email, password and user_type are required'
      //   });
      // }

      const user = await User.findOne({
        where: {
          email: {
            [Op.iLike]: email  // ← Case insensitive search
       },
          user_type: user_type
        }
      });
    
      console.log('👤 User found?', user ? 'YES ✅' : 'NO ❌');
      console.log('👤 User details:', user ? { email: user.email, user_type: user.user_type } : 'None');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: `❌ No ${user_type} account found with this email. Please register first.`
        });
      }
      
      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: '❌ Account is disabled. Please contact support.'
        });
      }
      
      // Check if email is verified
      if (!user.is_verified) {
        const otp = OTPService.generateOTP();
        const otpExpiry = new Date(Date.now() + 600000);
        user.otp_code = otp;
        user.otp_expires_at = otpExpiry;
        await user.save();
        
        try {
          await OTPService.sendOTP(user.phone_number, user.email, otp);
        } catch (e) {
          console.log('⚠️ OTP send failed but continuing');
        }
        
        return res.status(403).json({
          success: false,
          message: '❌ Email not verified. A new OTP has been sent to your email.',
          requires_otp: true,
          user_id: user.user_id
        });
      }
      
      // Validate password
      const isValid = await user.validatePassword(password);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: '❌ Invalid password. Please try again.'
        });
      }
      
      const token = generateToken({
        user_id: user.user_id,
        user_type: user.user_type
      });
      
      console.log('✅ Login successful:', user.user_id);
      
      res.status(200).json({
        success: true,
        message: `✅ Welcome ${user.full_name}!`,
        data: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          phone_number: user.phone_number,
          user_type: user.user_type,
          registration_code: user.registration_code,
          company_name: user.company_name,
          is_verified: user.is_verified,
          token,
          redirectTo: user.user_type === 'user' ? '/user-dashboard' : 
                      user.user_type === 'manager' ? '/manager-dashboard' : '/author-dashboard'
        }
      });
      
    } catch (error) {
      console.error('❌ Login error:', error);
      next(error);
    }
  }
  
  // Verify OTP
  static async verifyOTP(req, res, next) {
    try {
      const { user_id, otp } = req.body;
      
      if (!user_id || !otp) {
        return res.status(400).json({
          success: false,
          message: '❌ user_id and otp are required'
        });
      }
      
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '❌ User not found'
        });
      }
      
      if (!user.otp_code || !user.otp_expires_at) {
        return res.status(400).json({
          success: false,
          message: '❌ No OTP found. Please request a new one.'
        });
      }
      
      if (new Date() > new Date(user.otp_expires_at)) {
        return res.status(400).json({
          success: false,
          message: '❌ OTP has expired. Please request a new one.'
        });
      }
      
      if (user.otp_code !== otp) {
        return res.status(400).json({
          success: false,
          message: '❌ Invalid OTP. Please try again.'
        });
      }
      
      user.otp_code = null;
      user.otp_expires_at = null;
      user.is_verified = true;
      await user.save();
      
      res.status(200).json({
        success: true,
        message: '✅ OTP verified successfully! You can now login.'
      });
      
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      next(error);
    }
  }
  
  // Resend OTP
  static async resendOTP(req, res, next) {
    try {
      const { user_id } = req.body;
      
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '❌ User not found'
        });
      }
      
      const otp = OTPService.generateOTP();
      const otpExpiry = new Date(Date.now() + 600000);
      user.otp_code = otp;
      user.otp_expires_at = otpExpiry;
      await user.save();
      
      try {
        await OTPService.sendOTP(user.phone_number, user.email, otp);
      } catch (e) {
        console.log('⚠️ OTP send failed');
      }
      
      res.status(200).json({
        success: true,
        message: '✅ OTP resent successfully to your email.'
      });
      
    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      next(error);
    }
  }
  // Forgot Password - Send OTP to reset password
  static async forgotPassword(req, res, next) {
    try {
      const { email, user_type } = req.body;
    
    // Validate input
      if (!email || !user_type) {
        return res.status(400).json({
          success: false,
          message: '❌ Email and user_type are required'
        });
      }
    
    // Find user
      const user = await User.findOne({
        where: {
          email: email,
          user_type: user_type
        }
      });
    
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `❌ No ${user_type} account found with this email.`
        });
      }
    
    // Generate OTP
      const otp = OTPService.generateOTP();
      const otpExpiry = new Date(Date.now() + 600000); // 10 minutes
    
      user.otp_code = otp;
      user.otp_expires_at = otpExpiry;
      await user.save();
    
    // Send OTP
      await OTPService.sendOTP(user.phone_number, user.email, otp);
    
      res.status(200).json({
        success: true,
        message: '✅ Password reset OTP sent to your email.',
        data: { user_id: user.user_id }
      });
    
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      next(error);
    }
  }

// Reset Password - Verify OTP and set new password
  static async resetPassword(req, res, next) {
    try {
      const { user_id, otp, new_password } = req.body;
    
    // Validate input
      if (!user_id || !otp || !new_password) {
        return res.status(400).json({
          success: false,
          message: '❌ user_id, otp and new_password are required'
        });
      }
    
    // Validate password length
      if (new_password.length < 6) {
        return res.status(400).json({
          success: false,
          message: '❌ Password must be at least 6 characters'
        });
      }
    
    // Find user
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '❌ User not found'
        });
      }
    
    // Verify OTP
      if (!user.otp_code) {
        return res.status(400).json({
          success: false,
          message: '❌ No OTP found. Please request a new one.'
        });
      }
    
      if (new Date() > new Date(user.otp_expires_at)) {
        return res.status(400).json({
          success: false,
          message: '❌ OTP has expired. Please request a new one.'
        });
      }
    
      if (user.otp_code !== otp) {
        return res.status(400).json({
          success: false,
          message: '❌ Invalid OTP. Please try again.'
        });
      }
    
    // Update password
      user.password_hash = new_password;
      user.otp_code = null;
      user.otp_expires_at = null;
      await user.save();
    
      res.status(200).json({
        success: true,
        message: '✅ Password reset successfully! You can now login.'
      });
    
    } catch (error) {
      console.error('❌ Reset password error:', error);
      next(error);
    }
  }
  
  // Get current user
  static async getCurrentUser(req, res, next) {
    try {
      const user = await User.findByPk(req.user.user_id, {
        attributes: { exclude: ['password_hash', 'otp_code'] }
      });
      
      res.status(200).json({
        success: true,
        data: user
      });
      
    } catch (error) {
      console.error('❌ Get user error:', error);
      next(error);
    }
  }
}

module.exports = { AuthController };