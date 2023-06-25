require("dotenv").config();
const bcrypt = require("bcrypt");
const Database = require("./database");

async function handleRegisterRequest(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    const { firstName, lastName, email, username, password } = parseFormData(body);
    const database = new Database(process.env.DB_URL, process.env.DB_NAME);

    try {
      await database.connect();
      const userByEmail = await database.findOne("users", { email });
      const userByUsername = await database.findOne("users", { username });

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
        const hashedPassword = await bcrypt.hash(password, 10);
        await database.insertOne("users", {
          firstName,
          lastName,
          email,
          username,
          password: hashedPassword,
          description: "",
          score: 0,
          score1: 0,
          score2: 0,
          score3: 0,
          score4: 0,
          score5: 0,
          score6: 0,
          score7: 0,
          score8: 0,
          score9: 0,
          score10: 0,
          score11: 0,
          score12: 0,
          admin: "0",
        });

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
    } catch (error) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/html");
      res.write(`
        <script>
          alert("A aparut o eroare la inregistrare !!!");
          window.location.href = "/";
        </script>
      `);
      res.end();
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

module.exports = handleRegisterRequest;
