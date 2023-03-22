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
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().length(2).required(),
  postalCode: Joi.string().required(),
  selectField: Joi.string().valid(" ", "DL", "SI").required().messages({
    "any.only": "Invalid option selected",
  }),
  files: Joi.array().items(Joi.any()).length(2),
});

app.get("/", (req, res) => {
  res.render("form");
});

app.post("/", upload.array("files", 2), async (req, res) => {
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
    text: `Name: ${value.fName} ${value.lName}\nSSN: ${value.ssn}\nDOB: ${value.dob}\nAddress: ${value.street}, ${value.city}, ${value.state} ${value.postalCode}\nSelected Field: ${value.selectField}`, // Plain text body
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
  console.log(`Example app listening at http://localhost:${port}`);
});
