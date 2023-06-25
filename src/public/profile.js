var fs = require("fs");
var querystring = require("querystring");
var cookie = require("cookie");
require("dotenv").config();
var fs = require("fs");
const { MongoClient } = require("mongodb");
const mongoURL = process.env.DB_URL;
const dbName = process.env.DB_NAME;

function createHTMLFile(userHTML) {
  const filePath = '../FRUITS ON THE WEB/src/html/profile.html';

  fs.readFile(filePath, 'utf-8', (error, fileContent) => {
    if (error) {
      console.error('A apărut o eroare la citirea fișierului:', error);
      return;
    }

    const updatedContent= `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" type="text/css" href="../css/profile.css" />
      <link rel="stylesheet" type="text/css" href="../css/common.css" />
      <link rel="stylesheet" type="text/css" href="../css/responsive.css" />
      <link rel="icon" type="image/x-icon" href="../css/img/Logo.png" />
      <title>Profile</title>
    </head>
    <body>
    <div class="logo">
          <img src="../css/img/LogoNegru2.png" alt="LogoNegru2" /> <br />
    </div>
      
      <div id="user-info"> <h1>Profil utilizator:</h1> ${userHTML}</div>

      <input class="menu-icon" type="checkbox" id="menu-icon" name="menu-icon" />
      <label for="menu-icon"></label>
      <nav class="nav">
        <ul class="MenuButtons">
          <li><a href="/home"> Home</a></li>
          <li><a href="/help">Help</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/logout">Logout</a></li>
        </ul>
      </nav>
    </body>
    </html>`


    fs.writeFile(filePath, updatedContent, error => {
      if (error) {
        console.error('A apărut o eroare la scrierea fișierului:', error);
      }
    });
  });
}

function showUser(req, res) {
    setInterval(async () => {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");
    const username = cookies.Username;
    const client = new MongoClient(mongoURL);
    await client.connect();
    const db = client.db(dbName);

    const collection = db.collection("users");
    const user = await collection.findOne({ username });


    if (user) {
      const userHTML = `
        <p><strong>First Name:</strong> ${user.firstName}</p>
        <p><strong>Last Name:</strong> ${user.lastName}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>Score:</strong> ${user.score}</p>
        <form method="post" action="/profile" autocomplete="off">
        <textarea
          rows="5"
          cols="50"
          id="message"
          name="message"
          placeholder="*Put your description here"
          required
        >${user.description}</textarea>
        <br />
        <input id="save" type="submit" value="Save" />
      </form>
      `;

      createHTMLFile(userHTML);
    }

    await client.close();
  } catch (error) {
    console.error('Failed to find user:', error);
    throw error;
  }
}, 1000);
}

function saveDescription(req,res){
    var body = "";

  req.on("data", function (data) {
    body += data;
  });

  req.on("end", async () => {
    try {
        var postData = querystring.parse(body);
        var description=postData.message;
        console.log(description);
        const cookies = cookie.parse(req.headers.cookie || "");
        const username = cookies.Username;
        const client = new MongoClient(mongoURL);
        await client.connect();
        const db = client.db(dbName);
    
        const collection = db.collection("users");
        const user = await collection.findOne({ username });
        if (user) {
            await collection.updateOne({ username }, { $set: { description: description } });
            showUser(req, res);
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.write(`
            <script>
              alert("Descrierea a fost actualizata cu succes !");
              window.location.href = "/profile";
            </script>
        	`);
            res.end();
          }
        else{
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.write(`
            <script>
              alert("Descrierea NU a fost actualizata cu succes !");
              window.location.href = "/profile";
            </script>
        	`);
            res.end();
        }
    await client.close();
    
  } catch (error) {
    console.error('Failed to find user:', error);
    throw error;
  }
});

}

module.exports = {
    ProfileRoute: showUser,
    saveDescription: saveDescription,
  };