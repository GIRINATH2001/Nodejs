update_out_of_stock 01

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
app.post("/", validator(RequestValidations.udpateRecord), async (req, res) => {
  try {
    let catalystApp = catalyst.initialize(req);

    const zcqlAPI = catalystApp.zcql();

    const { stockid } = req?.body;

    const updateQuery = `UPDATE out_of_stock SET isactive = ${false} WHERE ROWID = ${stockid}`;

    const updateResult = await zcqlAPI.executeZCQLQuery(updateQuery);

    let updatedRecord = updateResult?.[0]?.out_of_stock;

    if (!updatedRecord) {
      return res.status(201).json({
        data: {
          status: 0,
          message: "Out of stock not found!",
        },
      });
    }

    return res.status(201).json({
      data: {
        status: 1,
        message: "Order status updated successfully.",
      },
    });
  } catch (err) {
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




update_out_of_stock 02


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





update_out_of_stock 03


const Joi = require("joi");

class RequestValidations {
  static udpateRecord = {
    body: Joi.object().keys({
      stockid: Joi.string().required(),
    }),
  };
}

module.exports = { RequestValidations };
