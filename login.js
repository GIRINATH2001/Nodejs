login 1



const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const catalyst = require("zcatalyst-sdk-node");
const { RequestValidations } = require("./validations");
const { validator } = require("./middlewares/common.middleware");
const bcrypt = require("bcryptjs");

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

// Define routes
app.post("/", validator(RequestValidations.validateLogin), async (req, res) => {
  try {
    let catalystApp = catalyst.initialize(req);

    const zcqlAPI = catalystApp.zcql();

    const { username, password } = req?.body;

    // const validateLoginQuery = `SELECT * FROM outlet_contact_person JOIN outlets ON outlet_contact_person.outlet_id=outlets.ROWID where outlet_contact_person.user_name = '${username?.trim()}'`;
    const validateLoginQuery = `SELECT outlet_contact_person.user_name, outlet_contact_person.first_name, outlet_contact_person.last_name, outlet_contact_person.ROWID, outlet_contact_person.password, outlet_contact_person.mobile, outlet_contact_person.isactive, outlet_contact_person.emalid, outlet_contact_person.outlet_id, outlets.company_name FROM outlet_contact_person JOIN outlets ON outlet_contact_person.outlet_id=outlets.ROWID where outlet_contact_person.user_name = '${username?.trim()}'`;

    const queryResult = await zcqlAPI.executeZCQLQuery(validateLoginQuery);

    console.log("queryResult >>>", queryResult);

    const user = queryResult?.[0]?.outlet_contact_person;
    const company = queryResult?.[0]?.outlets;

    if (!user) {
      return res.status(200).json({
        message: "User name is invalid!",
        status: 0,
      });
    }

    // Check if user is inactive

    if (!user?.isactive) {
      return res.status(200).json({
        message: "User is deactivated!",
        status: 0,
      });
    }

    const checkPasswords = bcrypt.compareSync(
      password.trim(),
      user?.password?.trim()
    );

    if (!checkPasswords) {
      return res.status(200).json({
        message: "Password is incorrect!",
        status: 0,
      });
    }

    let name = `${user?.first_name}`;

    if (user?.last_name) {
      if (name) name += " " + `${user?.last_name}`;
      else name = `${user?.last_name}`;
    }

    function formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    const date = new Date();
    const lastLogin = formatDate(date);

    return res.status(200).json({
      data: {
        data: [
          {
            status: 1,
            userid: user.ROWID,
            password: password.trim(),
            name,
            mobile: user?.mobile ?? "",
            emalid: user?.emalid ?? "",
            company: company?.company_name ?? "",
            companyid: user?.outlet_id ?? "",
            roleid: 1,
            rolename: "MD",
            // Pass last login as current date
            lastlogin: lastLogin,
            status: 1,
            message: "Welcome back.",
            approvetype: 1,
            issuperadmin: 0,
            isadmin: 1,
            hasapprove: 0,
          },
        ],
      },
    });
  } catch (err) {
    console.log("Error: ", err);

    return res.status(400).json({
      error: err.message,
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




login 2

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



login 3

const Joi = require("joi");

class RequestValidations {
  static validateLogin = {
    body: Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string().required(),
    }),
  };
}

module.exports = { RequestValidations };

