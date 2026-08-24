import React, { useEffect, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';

const RealTimeNotification = () => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (socket) {
      const events = [
        'live-event-update',
        'seat-update',
        'booking-update',
        'hall-update',
        'manager-request'
      ];

      events.forEach(eventName => {
        socket.on(eventName, (data) => {
          const message = getNotificationMessage(eventName, data);
          setNotifications(prev => [
            { id: Date.now(), message, type: eventName },
            ...prev
          ].slice(0, 5)); // Keep last 5
        });
      });

      return () => {
        events.forEach(eventName => {
          socket.off(eventName);
        });
      };
    }
  }, [socket]);

  const getNotificationMessage = (event, data) => {
    switch (event) {
      case 'live-event-update':
        return `🔴 "${data.title}" is now LIVE!`;
      case 'seat-update':
        return `🪑 Seat ${data.seat_id} is now ${data.status}`;
      case 'booking-update':
        return `🎫 ${data.seats} tickets booked for "${data.event_title}"`;
      case 'hall-update':
        return `🏢 Hall "${data.hall_name}" is now ${data.status}`;
      case 'manager-request':
        return `👤 "${data.manager_name}" requested to book ${data.hall_name}`;
      default:
        return `📢 Update received`;
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map(n => (
        <div key={n.id} className={`notification-bubble ${n.type}`}>
          {n.message}
        </div>
      ))}
    </div>
  );
};

export default RealTimeNotification;