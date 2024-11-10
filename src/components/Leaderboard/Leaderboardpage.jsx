import React, { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard.jsx';
import axios from 'axios';
import './leaderboardpage.css';
const LeaderboardPage = () => {
  const [highestBalance, setHighestBalance] = useState([]);
  const [mostLuffy, setMostLuffy] = useState([]);
  const [mostTrades, setMostTrades] = useState([]);
  
  const fetchTopBalResponse = async () => {
    try {
        const topBalResponse = await axios.get('/api/leaderboard/highestBalance');
        setHighestBalance(topBalResponse.data);
    } catch (err) {
        console.error('Error fetching highest balance leaderboard:', err);
    }
 }

  const fetchMostLuffyResponse = async () => {
    try {
        const mostLuffyResponse = await axios.get('/api/leaderboard/mostLuffy');
        setMostLuffy(mostLuffyResponse.data);
    } catch (err) {
        console.error('Error fetching most Luffy leaderboard:', err);
    }
 }

  const fetchMostTradesResponse = async () => {
    try {
        const mostTradesResponse = await axios.get('/api/leaderboard/mostTrades');
        setMostTrades(mostTradesResponse.data);
    } catch (err) {
        console.error('Error fetching most trades leaderboard:', err);
    }
 }

  // Fetch leaderboard data
  useEffect(() => {
    fetchTopBalResponse();
    fetchMostLuffyResponse();
    fetchMostTradesResponse();
    
  }, []);

  

  return (
    <div className="leaderboard-page">
      <h1>Leaderboards</h1>
      
      <div className="leaderboards">
        <Leaderboard title="Highest Balances" data={highestBalance} />
        <Leaderboard title="Most Luffy Collected" data={mostLuffy} />
        <Leaderboard title="Most Trades" data={mostTrades} />
      </div>
    </div>
  );
  }

export default LeaderboardPage;