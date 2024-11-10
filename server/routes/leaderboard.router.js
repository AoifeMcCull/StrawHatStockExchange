const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();

/**
 * GET route template
 */
router.get('/highestBalance', async (req, res) => {
    console.log('getting top bal leaderboard');
      try {
      const result = await pool.query(`
        select u.name, u.balance AS value
        from "user" u
        where u.leaderboard_show = true
        order by u.balance desc 
        limit 10
      `);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching leaderboard data', err);
      res.status(500).send('Server error');
    }
  });

  router.get('/mostLuffy', async (req, res) => {
    console.log('getting most luffy leaderboard');
    try {
      const result = await pool.query(`
        SELECT u.name, SUM(upi.amount) AS value
        FROM "user" u
        JOIN user_pirate_inventory upi ON u.id = upi.userid
        WHERE upi.pirateid = 4
        GROUP BY u.name
        ORDER BY value DESC
        LIMIT 10
      `);

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching leaderboard data', err);
      res.status(500).send('Server error');
    }
  });

  router.get('/mostTrades', async (req, res) => {
    console.log('getting most trades board');
    try {
      const result = await pool.query(`
        SELECT u.name, COUNT(t.transactionid) AS value
        FROM "user" u
        JOIN transactions t ON u.id = t.userbuyid OR u.id = t.usersellid
        GROUP BY u.name
        ORDER BY value DESC
        LIMIT 10
      `);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching leaderboard data', err);
      res.status(500).send('Server error');
    }
  });

/**
 * POST route template
 */
router.post('/', (req, res) => {
  // POST route code here
});

module.exports = router;
