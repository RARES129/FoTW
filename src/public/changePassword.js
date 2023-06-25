const { getToken, getUsername } = require("./resetPassword.js");
var querystring = require("querystring");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
require("dotenv").config();

const mongoURL = process.env.DB_URL;
const dbName = process.env.DB_NAME;

async function updateDB(req, res, username, password) {
  try {
    const client = new MongoClient(mongoURL);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("users");
    const user = await collection.findOne({ username });
    const hashedPassword = await bcrypt.hash(password, 10);
    await collection.updateOne(
      { username },
      { $set: { password: hashedPassword } }
    );
    await client.close();
  } catch (error) {
    console.error("Failed to reset password:", error);
    throw error;
  }
}

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
      updateDB(req, res, username, password);
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
