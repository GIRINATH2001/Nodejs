'use strict';
const express = require('express');
const app = express();
const catalyst = require('zcatalyst-sdk-node');
app.use(express.json());
const ordersTableName = 'orders';  
const orderLineItemsTableName = 'order_line_items';
const itemMasterTableName='item_master';
const itemSizeTableName='item_size';
const  itemSizeDetails='item_size_details';
app.get('/get_order_details', async (req, res) => {
    try {
        const {OrderNo, CustomerId} = req.query;
        const catalystApp = catalyst.initialize(req);
        const zcqlAPI = catalystApp.zcql();
        const getRowIdQuery = `SELECT ROWID  FROM orders WHERE order_no = '${OrderNo}' AND outlet_id = '${CustomerId}' `;
        const rowIdQueryResult = await zcqlAPI.executeZCQLQuery(getRowIdQuery);
        //console.log(rowIdQueryResult);
        if (rowIdQueryResult.length === 0) {
            return res.status(404).json({
                success: 0,
                message: 'No matching order found',
                response_code: 'ORDER_NOT_FOUND',
                status: 0,
            });
        }
        const rowId = rowIdQueryResult[0].orders.ROWID;
        console.log(rowId);
        const getRecords = `SELECT item, qty, unit_price, amount, tax_amount, total_amount, remarks, item_master.item_name, item_master.item_code, item_master.item_size, 
        item_size.size_name, item_size.ROWID, item_size_details.ROWID FROM order_line_items INNER JOIN item_master ON  order_line_items.item=item_master.ROWID 
        INNER JOIN item_size ON item_master.item_size=item_size.ROWID 
        INNER JOIN item_size_details ON item_size.ROWID=item_size_details.id_size WHERE order_id = '${rowId}'`;
        const queryResult = await zcqlAPI.executeZCQLQuery(getRecords);
        console.log("queryResult >>>", queryResult);

        let sno = 0;
        let serial_no = 0;
        const updatedRecords = queryResult?.map( (record) => {
            console.log(record);
            const itemId = record.order_line_items.item;
            const itemname = record.item_master.item_name;
            const itemcode = record.item_master.item_code;
            const idsize = record.item_size_details.ROWID;
            const sizename = record.item_size.size_name;
            const qty = record.order_line_items.qty;
            const unitprice = record.order_line_items.unit_price;
            const amount = record.order_line_items.amount;
            const taxamount = record.order_line_items.tax_amount;
            const totalamount = record.order_line_items.total_amount;
            const remarks = record.order_line_items.remarks;

            sno++;
            return {
                sno: sno,
                serialno: serial_no,
                itemcode: itemcode,
                itemname: itemname,
                idsize: idsize,
                sizename: sizename,
                qty: qty,
                unitprice: unitprice,
                amount: amount,
                taxamount: taxamount,
                totalamount: totalamount,
                remarks: remarks
            };
        });

        console.log("updatedRecords", updatedRecords)
       
        return res.status(200).json({
            data: {
            data: updatedRecords,
            status: 1,
            },
        });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = app;
