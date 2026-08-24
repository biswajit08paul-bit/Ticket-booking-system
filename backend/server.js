const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize } = require('./src/config/database');


// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const seatRoutes = require('./src/routes/seatRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const waitlistRoutes = require('./src/routes/waitlistRoutes');
const hallRoutes = require('./src/routes/hallRoutes');
const authorRoutes = require('./src/routes/authorRoutes');

const cron = require('node-cron');
const { SeatHoldService } = require('./src/services/seatHoldService');
const { WaitlistService } = require('./src/services/waitlistService');

// Import middleware
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/author', authorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join-event', (eventId) => {
    socket.join(`event-${eventId}`);
    console.log(`Socket ${socket.id} joined event-${eventId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

cron.schedule('* * * * *', async () => {
  try {
    const result = await SeatHoldService.releaseExpiredHolds();
    if (result.released > 0) {
      console.log(`Released ${result.released} expired holds`);
    }
  } catch (error) {
    console.error('Error releasing expired holds:', error);
  }
});

// Run every hour to expire waitlist offers
cron.schedule('0 * * * *', async () => {
  try {
    const result = await WaitlistService.expireOffers();
    if (result.expired > 0) {
      console.log(`Expired ${result.expired} waitlist offers`);
    }
  } catch (error) {
    console.error('Error expiring waitlist offers:', error);
  }
});
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync models (use { alter: true } for development only)
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized');
    require('./src/models/associations');
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    process.exit(1);
  }
};

startServer();