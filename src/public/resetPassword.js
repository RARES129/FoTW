var nodemailer = require("nodemailer");
var querystring = require("querystring");
const { v4: uuidv4 } = require("uuid");
const Database = require("./database");
require("dotenv").config();

const mongoURL = process.env.DB_URL;
const dbName = process.env.DB_NAME;

const mailSender = process.env.mailSender;
const mailPassword = process.env.password;

var token = "";
var resetUsername = "";

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: mailSender,
    pass: mailPassword,
  },
});

function generateToken() {
  return uuidv4();
}

async function searchDB(username) {
  const db = new Database(process.env.DB_URL, process.env.DB_NAME);
  try {
    await db.connect();
    const user = await db.findOne("users",{username});
    await db.disconnect();
    if (user) {
      return user.email;
    } else {
      return "-";
    }
  } catch (error) {
    console.error("Failed to find user:", error);
    throw error;
  }
}

function sendEmail(req, res) {
  var body = "";
  token = generateToken();
  req.on("data", function (data) {
    body += data;
  });

  req.on("end", async () => {
    var postData = querystring.parse(body);
    resetUsername = postData.username;
    var email = await searchDB(resetUsername);
    console.log(email);

    var message =
      "Foloseste token-ul de mai jos pentru a reseta parola userului " +
      resetUsername +
      "\n" +
      "TOKEN: " +
      token;

    var mailOptions = {
      from: mailSender,
      to: email,
      subject: "PASSWORD RESET FOTW",
      text: message,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
    if (email === "-") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      res.write(`
            <script>
              alert("ACEST USER NU EXISTA");
              window.location.href = "/reset_password";
            </script>
          `);
      res.end();
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      res.write(`
        <script>
          alert("Ai trimis email-ul  pentru resetarea parolei cu succes");
          window.location.href = "/change_password";
        </script>
      `);
      res.end();
    }
  });
}

function getToken() {
  return token;
}

function getUsername() {
  return resetUsername;
}

module.exports = {
  resetPassword: sendEmail,
  getToken: getToken,
  getUsername: getUsername,
};
