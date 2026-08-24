import React, { useState } from 'react';
import { authorService } from '../../services/api';
import '../../styles/MallManagement.css';

const MallManagement = ({ malls, onUpdate }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newMall, setNewMall] = useState({
    mall_name: '',
    group: '',
    total_halls: 0,
    price_per_hall: 0,
    location: ''
  });

  const handleCreateMall = async (e) => {
    e.preventDefault();
    try {
      await authorService.createMall(newMall);
      onUpdate();
      setShowCreate(false);
      setNewMall({ mall_name: '', group: '', total_halls: 0, price_per_hall: 0, location: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create mall');
    }
  };

  const handleSetPrice = async (mallId, price) => {
    try {
      await authorService.updateMallPrice(mallId, { price_per_hall: price });
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update price');
    }
  };

  return (
    <div className="mall-management">
      <div className="mall-header">
        <h2>🏢 Mall Management</h2>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          ➕ Add New Mall
        </button>
      </div>

      <div className="mall-grid">
        {malls.map(mall => (
          <div key={mall.mall_id} className="mall-card">
            <div className="mall-info">
              <h4>{mall.mall_name}</h4>
              <p>Group: {mall.group}</p>
              <p>🏠 {mall.total_halls} halls</p>
              <p>📅 Booked: {mall.booked_halls || 0}</p>
              <p>✅ Available: {mall.available_halls || 0}</p>
              <p>💰 ₹{mall.price_per_hall}/hall</p>
            </div>
            <div className="mall-actions">
              <input
                type="number"
                placeholder="Set price"
                className="price-input"
                onChange={(e) => handleSetPrice(mall.mall_id, e.target.value)}
              />
              <span className={`status ${mall.status}`}>
                {mall.status || 'Active'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Mall</h3>
            <form onSubmit={handleCreateMall}>
              <input
                type="text"
                placeholder="Mall Name"
                value={newMall.mall_name}
                onChange={(e) => setNewMall({...newMall, mall_name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Group Name"
                value={newMall.group}
                onChange={(e) => setNewMall({...newMall, group: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Total Halls"
                value={newMall.total_halls}
                onChange={(e) => setNewMall({...newMall, total_halls: parseInt(e.target.value)})}
                required
              />
              <input
                type="number"
                placeholder="Price per Hall"
                value={newMall.price_per_hall}
                onChange={(e) => setNewMall({...newMall, price_per_hall: parseInt(e.target.value)})}
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={newMall.location}
                onChange={(e) => setNewMall({...newMall, location: e.target.value})}
                required
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Create</button>
                <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MallManagement;