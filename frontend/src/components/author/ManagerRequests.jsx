import React, { useState } from 'react';
import { authorService } from '../../services/api';

const ManagerRequests = ({ requests, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleApprove = async (requestId) => {
    setLoading(true);
    try {
      await authorService.approveManager({ request_id: requestId });
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="manager-requests">
        <h2>👥 Manager Requests</h2>
        <p>No pending requests</p>
      </div>
    );
  }

  return (
    <div className="manager-requests">
      <h2>👥 Manager Requests</h2>
      
      <div className="requests-list">
        {requests.map(request => (
          <div key={request.request_id} className="request-card">
            <div className="request-info">
              <h4>{request.manager_name}</h4>
              <p>Request for: {request.hall_name}</p>
              <p>Duration: {request.duration} days</p>
            </div>
            <div className="request-actions">
              <button 
                className="btn-success btn-sm"
                onClick={() => handleApprove(request.request_id)}
                disabled={loading}
              >
                Approve
              </button>
              <button className="btn-danger btn-sm">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerRequests;