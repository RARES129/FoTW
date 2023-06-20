var nodemailer = require("nodemailer");
var querystring = require("querystring");
require("dotenv").config();

const mailSender = process.env.mailSender;
const mailPassword = process.env.password;
const mailReceiver = process.env.mailReceiver;

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: mailSender,
    pass: mailPassword,
  },
});

function sendEmail(req, res) {
  var body = "";

  req.on("data", function (data) {
    body += data;
  });

  req.on("end", function () {
    var postData = querystring.parse(body);
    var email = postData.email;
    var subject = postData.subject;
    var message = "Email: " + email + "\n" + "Text: \n" + postData.message;

    var mailOptions = {
      from: mailSender,
      to: mailReceiver,
      subject: subject,
      text: message,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.write(`
        <script>
          alert("Ai trimis email-ul cu succes");
          window.location.href = "/help";
        </script>
      `);
    res.end();
  });
}

module.exports = sendEmail;
