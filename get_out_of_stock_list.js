get_out_of_stock_list  1


const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const catalyst = require("zcatalyst-sdk-node");
const { RequestValidations } = require("./validations");
const { validator } = require("./middlewares/common.middleware");

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

// Define routes
app.post(
  "/",
  validator(RequestValidations.getOutOfStockList),
  async (req, res) => {
    try {
      let catalystApp = catalyst.initialize(req);

      const zcqlAPI = catalystApp.zcql();

      const { customerid } = req?.body;

      const getRecords = `SELECT itemcode, itemsize, stock_date, ROWID, userid, item_master.item_name, item_size_details.id_size, item_size.size_name FROM out_of_stock 
      INNER JOIN item_master ON out_of_stock.itemcode = item_master.ROWID
      INNER JOIN item_size_details ON out_of_stock.itemsize=item_size_details.ROWID 
      INNER JOIN item_size ON item_size_details.id_size=item_size.ROWID
      where customerid = '${customerid}'`;
      // const getRecords = `SELECT  out_of_stock.itemcode, out_of_stock.itemsize, out_of_stock.customerid, item_master.item_name as itemname, item_master.item_description as itemdescription, item_master.item_type_name as itemtype, item_size.size_name as sizename, item_type_details.item_type_name FROM out_of_stock INNER JOIN item_master
      // ON out_of_stock.itemcode=item_master.ROWID INNER JOIN item_size_details
      // ON out_of_stock.itemsize=item_size_details.ROWID  INNER JOIN item_size
      // ON item_size_details.id_size=item_size.ROWID INNER JOIN item_type_details
      // ON item_master.item_type_name=item_type_details.ROWID where customerid = '${customerid}'`;

      const queryResult = await zcqlAPI.executeZCQLQuery(getRecords);
      console.log("queryResult >>>", queryResult);

      // return res.send(queryResult);

      let sno = 0;

      const updatedRecords = queryResult?.map((record) => {
        sno++;
        return{
          sno: sno,
          id: record?.out_of_stock?.ROWID,
          itemname: record?.item_master?.item_name,
          itemsize: record?.item_size?.size_name,
          stockdate: record?.out_of_stock?.stock_date,
          username: record?.out_of_stock?.userid,
          
        };
        // return {
        //   sno: sno,
        //   itemcode: record?.out_of_stock?.itemcode,
        //   itemsize: record?.out_of_stock?.itemsize,
        //   customerid: record?.out_of_stock?.customerid,
        //   itemname: record?.item_master?.item_name,
        //   itemdescription: record?.item_master?.item_description,
        //   sizename: record?.item_size?.size_name,
        //   itemtype: record.item_type_details?.item_type_name,
        // };
      });

      return res.status(200).json({
        data: {
          data: updatedRecords,
          status: 1,
        },
      });
    } catch (err) {
      console.log("err", err);
      return res.status(400).json({
        error: err?.message,
        message: "Internal server error, something went wrong!",
        status: 0,
      });
    }
  }
);

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

module.exports = app;




get_out_of_stock_list  2

const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      // eslint-disable-next-line no-param-reassign
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

module.exports = { pick };




get_out_of_stock_list  3

const Joi = require("joi");

class RequestValidations {
  static getOutOfStockList = {
    body: Joi.object().keys({
      customerid: Joi.string().required(),
    }),
  };
}

module.exports = { RequestValidations };

