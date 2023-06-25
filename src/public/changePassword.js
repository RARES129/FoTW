const { getToken, getUsername } = require("./resetPassword.js");
var querystring = require("querystring");
const bcrypt = require("bcrypt");
var Database = require("./database");
require("dotenv").config();

const db = new Database(process.env.DB_URL, process.env.DB_NAME);


async function startServer() {
  await db.connect();
}

startServer();

function changePassword(req, res) {
  var body = "";
  req.on("data", function (data) {
    body += data;
  });

  req.on("end", async () => {
    var postData = querystring.parse(body);
    const token = postData.token;
    const password = postData.password;
    const correctToken = getToken();
    const username = getUsername();
    if (token === correctToken) {
      db.resetPassword(username, password);
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      res.write(`
            <script>
              alert("Parola a fost schimbata cu succes");
              window.location.href = "/";
            </script>
          `);
      res.end();
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      res.write(`
            <script>
              alert("Token-ul nu este valid !");
              window.location.href = "/change_password";
            </script>
          `);
      res.end();
    }
  });
}

module.exports = changePassword;
