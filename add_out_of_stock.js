add_out_of_stock 1



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
app.post("/", validator(RequestValidations.addRecord), async (req, res) => {
  try {
    let catalystApp = catalyst.initialize(req);
    const zcqlAPI = catalystApp.zcql();
    const { customerid, itemcode, itemsize, stockdate, userid } = req?.body;
    let stock_date = stockdate;
    const [day, month, year] = stock_date.split('-');
    const date1 = new Date(`${year}-${month}-${day}`);
    const formattedDate = date1.toISOString().split('T')[0];
    const getItemsQuery = `SELECT * FROM item_size_details where customer_id = '${customerid}' AND item_code = '${itemcode}'`;

    const itemsResult = await zcqlAPI.executeZCQLQuery(getItemsQuery);

    let valuesString = "";

    if (!itemsResult?.length) {
      return res.status(201).json({
        data: {
          status: 0,
          message: "Create failed, items not found!",
        },
      });
    }

    const createPromises = [];

    const successRes = [];

    itemsResult.forEach((item, index) => {
      // if (index == itemsResult.length - 1) {
      //   valuesString += `('${item?.item_size_details?.customer_id}', '${
      //     item?.item_size_details?.item_code
      //   }', '${stockdate}', '${true}', '${
      //     item?.item_size_details?.id_size
      //   }', '${userid}')`;
      //   return;
      // }
      // valuesString += `('${item?.item_size_details?.customer_id}', '${
      //   item?.item_size_details?.item_code
      // }', '${stockdate}', '${true}', '${
      //   item?.item_size_details?.id_size
      // }', '${userid}'), `;

      createPromises.push(async () => {
        const createQuery = `INSERT INTO out_of_stock (customerid, itemcode, stock_date, isactive, itemsize, userid ) VALUES (${
          item?.item_size_details?.customer_id
        }, '${
          item?.item_size_details?.item_code
        }', '${formattedDate}', '${true}', '${
          item?.item_size_details?.ROWID
        }', '${userid}')`;

        const queryResult = await zcqlAPI.executeZCQLQuery(createQuery);

        const newRecord = queryResult?.[0]?.out_of_stock;

        if (newRecord) successRes.push(newRecord);

        return newRecord;
      });
    });

    const addResponse = await Promise.all(createPromises.map((func) => func()));

    // console.log("addResponse", addResponse);
    // console.log("successRes", successRes);

    if (successRes.length !== itemsResult.length)
      return res.status(201).json({
        data: {
          status: 0,
          message:
            "Create failed, some of the items are not added to out of stock!",
        },
      });

    return res.status(201).json({
      data: {
        status: 1,
        message: "Added successfully.",
      },
    });
  } catch (err) {
    console.log("err ", err);
    return res.status(400).json({
      error: err?.message,
      message: "Internal server error, something went wrong!",
      status: 0,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

module.exports = app;


add_out_of_stock  2

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



add_out_of_stock  3



const Joi = require("joi");

class RequestValidations {
  static addRecord = {
    body: Joi.object().keys({
      customerid: Joi.string().required(),
      itemcode: Joi.string().required(),
      itemsize: Joi.number().required(),
      stockdate: Joi.string().required(),
      userid: Joi.string().required(),
    }),
  };
}

module.exports = { RequestValidations };

