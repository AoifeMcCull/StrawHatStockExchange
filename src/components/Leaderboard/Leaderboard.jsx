import React from 'react';

const Leaderboard = ({ title, data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="leaderboard">
        <h2>{title}</h2>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h2>{title}</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.name}</td>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;