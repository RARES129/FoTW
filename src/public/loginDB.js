require("dotenv").config();
var url = require("url");
var fs = require("fs");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const mongoURL = process.env.DB_URL;
const dbName = process.env.DB_NAME;

function generateToken() {
  return uuidv4();
}

function handleLoginRequest(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    const { username, password } = parseFormData(body);
    const user = await findUser(username);

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = generateToken();
      console.log(user.admin);

      if(user.admin === "1"){
      
      res.setHeader("Set-Cookie", [`Username=${username}; Path=/;`, `Logat=${token}; Path=/;`,`Admin=1; Path=/;`]);
      }
      else res.setHeader("Set-Cookie", [`Username=${username}; Path=/;`, `Logat=${token}; Path=/;`,`Admin=0; Path=/;`]);
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      res.write(`
        <script>
          alert("Te-ai logat cu succes");
          window.location.href = "/home";
        </script>
      `);
      res.end();
    } else {
      res.setHeader("Content-Type", "text/html");
      res.write(`
        <script>
          alert("Ati introdus gresit username-ul sau parola !!!");
          window.location.href = "/";
        </script>
      `);
      res.end();
    }
  });
}

async function findUser(username) {
  const client = new MongoClient(mongoURL);
  await client.connect();

  const db = client.db(dbName);
  const collection = db.collection("users");

  const user = await collection.findOne({ username });

  client.close();

  return user;
}

function parseFormData(formData) {
  const data = {};
  const formFields = formData.split("&");

  for (let i = 0; i < formFields.length; i++) {
    const [key, value] = formFields[i].split("=");
    data[key] = decodeURIComponent(value);
  }

  return data;
}

module.exports = handleLoginRequest;

