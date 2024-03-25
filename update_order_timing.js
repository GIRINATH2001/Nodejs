'use strict';
const express = require('express');
const app = express();
const catalyst = require('zcatalyst-sdk-node');
app.use(express.json());
app.post('/update_order_timing', async (req, res) => {

    try{
    let catalystApp = catalyst.initialize(req);
    const zcqlAPI = catalystApp.zcql();
    const {customerid, orderid, userid, status} = req?.body;
    const updateQuery = `UPDATE orders SET status = ${status}, user_id = ${userid} WHERE order_no = ${orderid} AND outlet_id = ${customerid}`;
    const updateResult = await zcqlAPI.executeZCQLQuery(updateQuery);
    let updatedRecord = updateResult?.[0]?.orders;
    if (!updatedRecord) {
      return res.status(201).json({
        data: {
          status: 0,
          message: "Order Timing Not Update!",
        },
      });
    }
    return res.status(200).json({
      data: {
        status: 1,
        message: "Update Order timing successfully.",
      },
    });
    }catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = app;
