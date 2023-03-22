const express = require("express");
const Joi = require("joi");
const nodemailer = require("nodemailer");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static("public"));
app.set("view engine", "ejs");

const port = 5000;

// const schema = Joi.object({
//   fName: Joi.string().min(3).max(30).required(),
//   lName: Joi.string().min(3).max(30).required(),
//   ssn: Joi.string().regex(/^\d{3}-\d{2}-\d{4}$/),
//   dob: Joi.date().less(new Date("01/01/2023")).required(),
//   street: Joi.string().required(),
//   city: Joi.string().required(),
//   state: Joi.string().length(2).required(),
//   postalCode: Joi.string().required(),
//   selectField: Joi.string()
//     .valid("option1", "option2", "option3")
//     .required()
//     .messages({
//       "any.only": "Invalid option selected",
//     }),
//   file: Joi.any().required(),
//   filename: Joi.string(),
//   contentType: Joi.string(),
//   encoding: Joi.string(),
// });

app.get("/form", (req, res) => {
  res.render("form");
});

app.post("/form", (req, res) => {
  //   const { error, value } = schema.validate(req.body);
  //   if (error) {
  //     return res.status(400).send(error.details[0].message);
  //   }
  fName = req.body.fName;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ihemelanduchinedu@gmail.com",
      pass: "tvgtvyjlezjfbeiw",
    },
  });

  const mailOptions = {
    from: "ihemelanduchinedu@gmail.com",
    to: "chinedujoey16@gmail.com",
    subject: "New Message from Contact Form",
    text: `fName: ${fName}`,
    // text: `fName: ${value.fName}\nlName: ${value.lName}\nSsn: ${value.ssn}\nStreet: ${value.street}\nDOB: ${value.dob}\nState: ${value.state}\nCity: ${value.city}\nZipcode: ${value.postalCode}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return res.status(500).send("Failed to send email");
    } else {
      console.log("Email sent: " + info.response);
      return res.status(200).send("Email sent successfully");
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
