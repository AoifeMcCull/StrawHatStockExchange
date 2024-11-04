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
SELECT
  p.pirateId,
  p.pirateName,
  t.price,
  t.transactionDateTime
FROM pirate p
JOIN transactions t ON p.pirateId = t.pirateId
WHERE t.transactionDateTime = (
  SELECT MAX(transactionDateTime)
    FROM transactions t2
    WHERE t2.pirateId = p.pirateId
)
ORDER BY t.transactionDateTime DESC;`;
  pool
    .query(queryText)
    .then((result) => {res.send(result.rows)})
    .catch((err) => {
      console.log('router: Get pirate cards failed: ', err);
      res.sendStatus(500);
    });
});



/**
 * POST route template
 */
router.post('/', (req, res) => {
  // POST route code here
});

module.exports = router;