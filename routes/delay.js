const express = require("express");
const router = express.Router();
//require twilio credentials
const client = require("twilio")(
  `${process.env.TWILIO_ACCOUNT_SID}`,
  `${process.env.TWILIO_AUTH_TOKEN}`
);
//orders.id = 6 ?????
//how get order_id from HTML?
module.exports = (db) => {
  router.post("/", (req, res) => {
    let order_id = parseInt(req.body.user_id);
    const text = `
    SELECT orders.id as order_id, users.phone
    FROM orders
    JOIN users ON (orders.user_id = users.id)
    WHERE orders.id = $1
    GROUP BY orders.id, users.phone;`;
    const values = [order_id];
    db.query(text, values)
      .then((data) => {
        const usersPhone = data.rows[0].phone;
        console.log("user phone numbers:", usersPhone);
        let sms = `Your order has been delayed.`;
        client.messages
          .create({
            body: sms,
            from: process.env.TWILIO_PHONE,
            to: process.env.PHONE, //client phone number use => usersPhone
          })
          .then((message) => console.log(message.sid));
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
    res.redirect("/admin");
  });
  return router;
};
