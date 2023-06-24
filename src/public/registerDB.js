require("dotenv").config();
const bcrypt = require("bcrypt");
var MongoClient = require("mongodb").MongoClient;

const mongoURL = process.env.DB_URL;
const dbName = process.env.DB_NAME;

function handleRegisterRequest(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    const { firstName, lastName, email, username, password } =
      parseFormData(body);
    const userByEmail = await findUserByEmail(email);
    const userByUsername = await findUserByUsername(username);

    if (userByEmail) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      res.write(`
        <script>
          alert("Adresa de email exista deja !!!");
          window.location.href = "/register";
        </script>
      `);
      res.end();
    } else if (userByUsername) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      res.write(`
        <script>
          alert("Numele de utilizator există deja !!!");
          window.location.href = "/register";
        </script>
      `);
      res.end();
    } else {
      await insertUser(firstName, lastName, email, username, password);
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      res.write(`
        <script>
          alert("Contul a fost creat cu succes !!!");
          window.location.href = "/";
        </script>
      `);
      res.end();
    }
  });
}

async function findUserByEmail(email) {
  const client = new MongoClient(mongoURL);
  await client.connect();

  const db = client.db(dbName);
  const collection = db.collection("users");

  const user = await collection.findOne({ email });

  client.close();

  return user;
}

async function findUserByUsername(username) {
  const client = new MongoClient(mongoURL);
  await client.connect();

  const db = client.db(dbName);
  const collection = db.collection("users");

  const user = await collection.findOne({ username });

  client.close();

  return user;
}

async function insertUser(firstName, lastName, email, username, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const client = new MongoClient(mongoURL);
  await client.connect();

  const db = client.db(dbName);
  const collection = db.collection("users");

  await collection.insertOne({
    firstName,
    lastName,
    email,
    username,
    password: hashedPassword,
    score: 0,
    admin: "0",
  });

  client.close();
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

module.exports = handleRegisterRequest;
