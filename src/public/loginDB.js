require("dotenv").config();
const url = require("url");
const fs = require("fs");
const bcrypt = require("bcrypt");
const Database = require("./database");
const { v4: uuidv4 } = require("uuid");

const mongoURL = process.env.DB_URL;
const dbName = process.env.DB_NAME;

function generateToken() {
  return uuidv4();
}

async function handleLoginRequest(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    const { username, password } = parseFormData(body);
    const database = new Database(mongoURL, dbName);

    try {
      await database.connect();
      const user = await database.findOne("users",{username});
      var isAdmin="";
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken();
        if(user.admin === "1"){
          isAdmin = await bcrypt.hash("1", 10);
        }
        else{
          isAdmin = await bcrypt.hash("0", 10);
        }

        res.setHeader("Set-Cookie", [
          `Username=${username}; Path=/;`,
          `Logat=${token}; Path=/;`,
          `Admin=${isAdmin}; Path=/;`
        ]);
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
    } catch (error) {
      console.error("Failed to handle login request:", error);
      res.statusCode = 500;
      res.end("Internal Server Error");
    } finally {
      await database.disconnect();
    }
  });
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
