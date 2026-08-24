Readme.md

#  Ticket Booking System

A real-time full-stack ticket booking platform for movies and concerts with visual seat selection, temporary seat locking with automatic expiry, concurrency-safe booking, automated waitlist allocation, and QR-code ticket delivery through email.

---

##  Features

###  Customers
- Register and login with OTP verification
- Browse and filter events (Movies, Concerts, Plays, Sports)
- View visual seat map with real-time status (Available / Held / Booked)
- Select and hold seats with 10-minute TTL
- Complete booking and receive QR code ticket via email
- View booking history and cancel bookings
- Join waitlist for sold-out events

###  Organizers (Managers)
- Register and login with unique EVMANxxxx code
- Create events with venue, date, time, and pricing
- View booking summary and revenue per event
- Manage halls and event schedules

###  Admins
- Register and login with unique ADMxxxx code
- Create and manage venues
- Define seat layouts and categories (Premium, Standard, Economy, VIP)
- Manage users and system settings

---

## Tech Stack

| Layer              | Technology                     |
|-------             |------------                    |
| **Frontend**       | React.js, Socket.io-client |
| **Backend**        | Node.js, Express.js, Socket.io |
| **Database**       | PostgreSQL, Sequelize ORM |
| **Authentication** | JWT, bcryptjs |
| **Email**          | Nodemailer (Gmail) |
| **QR Code**        | qrcode |
| **Real-time**      | Socket.io |
| **Deployment**     | Render (Backend), Vercel (Frontend) |

---

## Project Structure



ticket-booking-system/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── email.js
│   │   │   └── jwt.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Event.js
│   │   │   ├── Hall.js
│   │   │   ├── Venue.js
│   │   │   ├── Seat.js
│   │   │   ├── EventSeat.js
│   │   │   ├── Booking.js
│   │   │   ├── BookingSeat.js
│   │   │   └── Waitlist.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── eventController.js
│   │   │   ├── bookingController.js
│   │   │   ├── seatController.js
│   │   │   ├── hallController.js
│   │   │   ├── authorController.js
│   │   │   └── adminController.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── eventRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── seatRoutes.js
│   │   │   ├── hallRoutes.js
│   │   │   ├── authorRoutes.js
│   │   │   └── adminRoutes.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   │
│   │   ├── services/
│   │   │   ├── seatHoldService.js
│   │   │   ├── waitlistService.js
│   │   │   └── qrService.js
│   │   │
│   │   └── utils/
│   │       ├── generateCode.js
│   │       └── otpService.js
│   │
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── RealTimeNotification.jsx
│   │   │   │
│   │   │   ├── user/
│   │   │   │   ├── UserDashboard.jsx
│   │   │   │   ├── MoviePosters.jsx
│   │   │   │   ├── SeatSelection.jsx
│   │   │   │   ├── BookingHistory.jsx
│   │   │   │   └── LiveEventBanner.jsx
│   │   │   │
│   │   │   ├── manager/
│   │   │   │   ├── ManagerDashboard.jsx
│   │   │   │   ├── HallManagement.jsx
│   │   │   │   ├── RevenueAnalytics.jsx
│   │   │   │   ├── EventSchedule.jsx
│   │   │   │   └── HallGroups.jsx
│   │   │   │
│   │   │   └── author/
│   │   │       ├── AuthorDashboard.jsx
│   │   │       ├── MallManagement.jsx
│   │   │       ├── RevenueOverview.jsx
│   │   │       └── ManagerRequests.jsx
│   │   │
│   │   ├── pages/
│   │   │   └── LoginPage.jsx
│   │   │
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   │
│   │   ├── styles/
│   │   │   ├── App.css
│   │   │   ├── Dashboard.css
│   │   │   ├── MoviePosters.css
│   │   │   ├── SeatSelection.css
│   │   │   └── HallManagement.css
│   │   │
│   │   ├── App.jsx
│   │   └── index.js
│   │
│   ├── .env
│   └── package.json
│
└── README.md


