const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();

/**
 * GET route template
 */
router.get('/', (req, res) => {
  // GET route code here
});
router.get('/usertransactions', (req, res) => {
  console.log('getting transactions for user:', req.body.userid);
  const queryText = `select * from transactions where userbuyid = ${req.body.userid} or usersellid = ${req.body.userid}`;
  pool
    .query(queryText)
    .then((result) => {res.send(result.rows)})
    .catch((err) => {
      console.log('router: Get users transactions failed: ', err);
      res.sendStatus(500);
    });
  });
  
router.get('/lowestsell', (req, res) => {
  console.log('getting lowest sell for pirate:', req.body.pirateid);
  const queryText = `select * from transactions 
  where is_closed = false 
  and userbuyid is null
  and pirateid = ${req.body.pirateid}
  order by price asc
  limit 1`;
  pool
    .query(queryText)
    .then((result) => {res.send(result.rows)})
    .catch((err) => {
      console.log('router: Get lowest sell failed: ', err);
      res.sendStatus(500);
    });
})

router.get('/highestbuy', (req, res) => {
  console.log('getting highest buy for pirate:', req.body.pirateid);
  const queryText = `select * from transactions 
  where is_closed = false 
  and usersellid is null
  and pirateid = ${req.body.pirateid}
  order by price desc
  limit 1`;
  pool
    .query(queryText)
    .then((result) => {res.send(result.rows)})
    .catch((err) => {
      console.log('router: Get highest buy failed: ', err);
      res.sendStatus(500);
    });
})

router.post('/newlimitorder', (req, res) => {
  console.log('adding new limit order:', req.body);
  const queryText = `insert into transactions 
  (userBuyId, userSellId, price, amount, pirateId, transactionDateTime, is_closed)
  values
  (
  ${req.body.buyid}, ${req.body.sellid}, ${req.body.price}, ${req.body.amount}, ${req.body.pirateId}, ${req.body.transactionDateTime}, false
  )
  `
  pool
    .query(queryText)
    .then(res.sendStatus(200))
    .catch((err) => {
      console.log('router: post order failed: ', err);
      res.sendStatus(500);
    });
})

router.post('/marketorder/preview', async (req, res) => {
  /*incoming req.body: 
  {
    buyid: int or null
    sellid: int or null
    amount: int
    pirateid: int
  }
  This route is a mess, and i know it is. it does work but if i could make it a second time i would include in the request
  body wether or not it's a buy or sell order, which would simplify it massively, but the biggest thing is that having
  a separate table for limit orders instead of storing them in transactions would make it much easier.
  returns an object
  {
    amountBought: int
    balanceTotal: int (balance gained or lost if the order is placed)
    remaining: int (if the market cannot fill the whole order, this is how many are missing)
  }
  */
  console.log('previewing potential market order for pirate', req.body)
  const { buyid, sellid, amount, pirateid} = req.body
  const isBuyOrder = buyid !== null; //true for buy orders
  if(!isBuyOrder){
    requesterid = sellid; //check if the user can actually sell
      const checkInventoryQuery = 
     `SELECT userid, pirateid, amount
      FROM user_pirate_inventory
      WHERE userid = $1 AND pirateid = $2`
    const checkInventory = await pool.query(checkInventoryQuery, [requesterid, req.body.pirateid])
    if(checkInventory.rowCount == 0 || checkInventory.rows[0].amount < amount){
      console.log('error checking inventory!'); return res.status(422).json({message: 'Error: not enough pirates!'})
    }
  } 
  
  const ascdesc = (isBuyOrder ? 'asc': 'desc') //find highest price if selling, lowest price if buying
  const buyidsellid = ((isBuyOrder ? 'userbuyid': 'usersellid')) //match sellers to buyers and vice versa
  const queryText = `
    SELECT 
    t.transactionId,
    t.userbuyid AS buyer_id, 
    t.usersellid AS seller_id, 
    t.pirateid AS pirate_id, 
    t.price, 
    t.amount 
FROM 
    transactions t
WHERE 
    t.pirateId = $1
    and is_closed = false
    and t.${buyidsellid} IS NULL
ORDER BY
    t.price ${ascdesc}
  `

  try {
    const result = await pool.query(queryText, [pirateid]);

    if (result.rows.length === 0) {
      return res.sendStatus(404);
    }

    let totalCostOrProceeds = 0;
    let remainingAmount = parseInt(amount);

    // Calculate total cost or proceeds based on open transactions
    for (const order of result.rows) {
      const availableAmount = order.amount;
      const price = order.price;

      if (remainingAmount === 0) break;

      if (remainingAmount <= availableAmount) {
        // the existing order is bigger than what we need or equal to it
        totalCostOrProceeds += (price * remainingAmount);
        remainingAmount = 0;
      } else {
        // we need more than this order can give us, so add it to our cost and subtract it from our remaining
        totalCostOrProceeds += price * availableAmount;
        remainingAmount -= availableAmount;
      }
    }

    
    res.send(
      {
        amountBought: (amount - remainingAmount),
        balanceTotal: totalCostOrProceeds,
        unbought: remainingAmount,
        buysell: isBuyOrder
      }
    )
  } catch (err) {
    console.error('Error previewing market order:', err);
    return res.status(500).send('Internal server error');
  }
})
//update existing open transaction to close it
//update existing transaction to reduce amount while placing a new closed order in DB
//update existing open transaction to change price
//delete existing open transaction


/**
 * POST route template
 */
router.post('/marketorder/place', async (req, res) => {
  /*

  incoming req.body:
  {
    pirateid: int,
    amount: int,
    buyid: into r null
    sellid: int or null
  }

  */

  console.log(`placing market order for ${req.body.amount} of pirate ${req.body.pirateid} on behalf of ${req.body.buyid} or ${req.body.sellid}`);
  console.log(req.body)
  const { buyid, sellid, amount, pirateid} = req.body
  const isBuyOrder = buyid !== null; //true for buy orders
  let requesterid = null;
  if(isBuyOrder){
     requesterid = buyid;
  }
  else{
     requesterid = sellid; //check if the user can actually sell
     try{
      const checkInventoryQuery = 
     `SELECT userid, pirateid, amount
      FROM user_pirate_inventory
      WHERE userid = $1 AND pirateid = $2`
      console.log(`checking inventory of user ${requesterid} for pirate ${req.body.pirateid}`);
    const checkInventory = await pool.query(checkInventoryQuery, [requesterid, req.body.pirateid])
    if(checkInventory.rowCount == 0 || checkInventory.rows[0].amount < amount){
      console.log('error checking inventory!', err); res.sendStatus(422);
    }
     } catch(err) {console.log('error!', err)}
     
  }
  const ascdesc = (isBuyOrder ? 'asc': 'desc') //find highest price if selling, lowest price if buying
  const buyidsellid = ((isBuyOrder ? 'userbuyid': 'usersellid')) //match sellers to buyers and vice versa
  const queryText = `
    SELECT 
      t.transactionId,
      t.userbuyid AS buyer_id, 
      t.usersellid AS seller_id, 
      t.pirateid AS pirate_id, 
      t.price, 
      t.amount 
    FROM 
      transactions t
    WHERE 
      t.is_closed = false
      AND t.${buyidsellid} IS NULL
      AND t.pirateid = $1
    ORDER BY
      t.price ${ascdesc}
  `;
  
  try {
    const result = await pool.query(queryText, [pirateid]);

    if (result.rows.length === 0) {
      console.log('sending 404');
      return res.sendStatus(404);
    }
    let remainingAmount = parseInt(amount);
    let totalCostOrProceeds = 0;

    for (const order of result.rows) {
      if(remainingAmount == 0) break; //stop when the order is done

      const availableAmount = order.amount;
      const price = order.price;

      if (remainingAmount <= availableAmount){
        //market order is smaller than limit order; close this limit order, make a new one
        //with the remainder at the same price. 
        totalCostOrProceeds += (price * remainingAmount);
        try{
          await fulfillOrder(order, remainingAmount, isBuyOrder, requesterid);
        } catch(err){
          console.log(err);
          break;
        }
        
        await updateTransaction(order.transactionid, remainingAmount, isBuyOrder, requesterid);

        remainingAmount = 0;
      }
      else {
        //we need more than we can get from this order
        totalCostOrProceeds += (price * availableAmount);
        await fulfillOrder(order, availableAmount, isBuyOrder, requesterid);
        await updateTransaction(order.transactionId, availableAmount, isBuyOrder, requesterid);
        remainingAmount -= availableAmount;
      }
    }
    console.log('sending headers');
    res.send({
      amountBought: (amount - remainingAmount),
      balanceTotal: totalCostOrProceeds,
      remaining: remainingAmount
    })
  } catch (err) { 
    console.log('error placing market order: ', err)
    res.sendStatus(500);
  }
});

async function fulfillOrder(order, amount, isBuyOrder, requesterid) {
  const price = order.price;
  const pirateId = order.pirate_id;

  if(isBuyOrder){
    order.buyer_id = requesterid;
    await updateUserBalance(order.seller_id, price * amount);
    console.log(`user ${order.seller_id} gained ${price * amount} coins!`)
    await updateUserBalance(order.buyer_id, -price * amount);
    console.log(`user ${order.buyer_id} lost ${price * amount} coins!`)
    await updatePirateInventory(order.buyer_id, pirateId, amount);
  } else {
    order.seller_id = requesterid;    
    await updateUserBalance(order.seller_id, price * amount);
    await updateUserBalance(order.buyer_id, -price * amount);
    await updatePirateInventory(order.seller_id, pirateId, -amount)
  }
}

async function updateTransaction(transactionId, amount, isBuyOrder, requesterid){
  const columnName = isBuyOrder ? 'userbuyid' : 'usersellid';
  const queryText = `
  UPDATE transactions
  set amount = amount - $1,
  ${columnName} = $3,
  transactiondatetime = CURRENT_TIMESTAMP
  Where transactionid = $2`;
  await pool.query(queryText, [amount, transactionId, requesterid]);
  console.log(`setting transaction ${transactionId} amount to itself minus ${amount}`)
  const transaction = await pool.query(`SELECT
    amount
  FROM
    transactions
  WHERE
    transactionid = $1`, [transactionId]);
    console.log(transaction)
  if(transaction.rows[0].amount == 0) {
    console.log('transaction finished!')
    console.log(await pool.query(`UPDATE transactions SET is_closed = true, amount = $2 WHERE transactionid = $1`, [transactionId, amount]));
  }
}

async function updateUserBalance(userid, price) {
  if(price == -0) price = 0;
  if(isNaN(price) || price == 0){
    //edge case error handling
    console.log(userid, price)
    throw new Error('user price is malformed!');  }
    const queryText = `
    UPDATE "user"
    SET balance = balance + $1
    WHERE id = $2`;

    try{
      await pool.query(queryText, [price, userid]);
    } catch (err) {
      console.log('Error updating user balance!!', err);
      throw new Error('Failed to update user balance');
    }
}

async function updatePirateInventory(userid, pirateid, amount) {
  const queryText = `
  UPDATE user_pirate_inventory
  SET amount = amount + $1
  WHERE userid = $2 AND pirateid = $3
  RETURNING amount;`;

  try{
    const result = await pool.query(queryText, [amount, userid, pirateid]);
    if(result.rowCount == 0){
      //the user has never owned this pirate before
      const insertQuery = `
      INSERT INTO user_pirate_inventory (userid, pirateid, amount)
      VALUES ($1, $2, $3)`;
      await pool.query(insertQuery, [userid, pirateid, amount]);
      return;
    }
  } catch (err) {
    console.error('critical! error updating pirate inventory!', err);
    throw new error('error updating pirate inventory');
  }
}

module.exports = router;
