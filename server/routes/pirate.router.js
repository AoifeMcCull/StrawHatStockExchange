const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();

/**
 * GET route template
 */
router.get('/', (req, res) => {
  // GET route code here
});
router.get('/pirateCards', (req, res, next) => {
  //Gets back a table with every pirate's ID, name, price, and time of most recent order
  console.log('getting pirate rows!');
  const queryText = `
SELECT DISTINCT ON (p.pirateId)
  p.pirateId,
  p.pirateName,
  t.price,
  t.transactionDateTime,
  c.crewName
FROM pirate p
JOIN transactions t ON p.pirateId = t.pirateId
JOIN crew c on p.crewId = c.crewId
WHERE t.is_closed = true
ORDER BY p.pirateId, t.transactionDateTime DESC;`;
  pool
    .query(queryText)
    .then((result) => {res.send(result.rows)})
    .catch((err) => {
      console.log('router: Get pirate cards failed: ', err);
      res.sendStatus(500);
    });
});

router.get('/portfolio/:userid/pirates', async (req, res) => {
  
  const { userid } = req.params; // Get the user id from the route params
  console.log(`fetching user ${userid}'s portfolio!`);
  // Query to fetch all pirates for the user where amount > 0
  const queryText = `
    SELECT 
    upi.inventoryitemid, 
    upi.pirateid, 
    p.piratename, 
    upi.amount, 
    t.price, 
    c.crewname
FROM 
    user_pirate_inventory upi
JOIN 
    pirate p ON upi.pirateid = p.pirateid
JOIN 
    (SELECT DISTINCT ON (pirateid) pirateid, price 
     FROM transactions 
     ORDER BY pirateid, transactiondatetime DESC) t ON p.pirateid = t.pirateid
JOIN 
    crew c ON p.crewId = c.crewId
WHERE 
    upi.userid = $1;
  `;
  pool.query(queryText, [userid])
  .then(
    (result) => {console.log(result.rows);res.send(result.rows)})
  .catch((err) => {
    console.log('error fetching user portfolio!', err)
  })

});


/**
 * POST route template
 */
router.post('/', (req, res) => {
  // POST route code here
});

module.exports = router;