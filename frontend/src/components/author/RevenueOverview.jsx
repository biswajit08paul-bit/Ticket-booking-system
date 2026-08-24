import React from 'react';

const RevenueOverview = ({ malls, managers }) => {
  const totalRevenue = malls?.reduce((sum, m) => sum + parseFloat(m.revenue || 0), 0) || 0;

  return (
    <div className="revenue-overview">
      <h2>💰 Revenue Overview</h2>
      
      <div className="revenue-stats">
        <div className="stat-card">
          <h3>₹{totalRevenue.toLocaleString()}</h3>
          <p>Total Revenue</p>
        </div>
        <div className="stat-card">
          <h3>{malls?.length || 0}</h3>
          <p>Total Malls</p>
        </div>
        <div className="stat-card">
          <h3>{managers?.length || 0}</h3>
          <p>Active Managers</p>
        </div>
      </div>

      <div className="revenue-table">
        <h3>Mall-wise Revenue</h3>
        <table>
          <thead>
            <tr>
              <th>Mall Name</th>
              <th>Group</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {malls?.map(mall => (
              <tr key={mall.mall_id}>
                <td>{mall.mall_name}</td>
                <td>{mall.group}</td>
                <td>₹{mall.revenue || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueOverview;