require("dotenv").config();
var url = require("url");
var fs = require("fs");
const { Feed } = require("feed");
const Parser = require("rss-parser");
const Database = require("./database");


const mongoURL = process.env.DB_URL;
const dbName = process.env.DB_NAME;

async function generateRSS() {
  const db = new Database(mongoURL, dbName);
  try {
    await db.connect();

    const users = await db.getUser();

    const feed = new Feed({
      title: "Leaderboard flux RSS",
      description: "Leaderboard updates",
      id: "https://fruitsontheweb.onrender.com/leaderboard",
      link: "https://fruitsontheweb.onrender.com/leaderboard",
      language: "ro",
    });

    users.forEach((user) => {
      feed.addItem({
        title: user.username,
        id: user.score,
        link: `https://fruitsontheweb.onrender.com/leaderboard/users/${user.username}`,
        description: `Leaderboard update for ${user.username}`,
        date: new Date(),
      });
    });

    const rss = feed.rss2();

    fs.writeFile("leaderboard.xml", rss, (error) => {
      if (error) {
        console.error("A apărut o eroare la scrierea fișierului:", error);
      } else {
        console.log('Fișierul "leaderboard.xml" a fost generat cu succes.');
      }
    });
  } catch (error) {
    console.error("A apărut o eroare:", error);
  } finally {
    await db.disconnect();
  }
}

generateRSS().catch((error) => {
  console.error("A apărut o eroare:", error);
});

function createHTMLFile(userScore) {
  const filePath = './src/html/leaderboard.html';

  fs.readFile(filePath, "utf-8", (error, fileContent) => {
    if (error) {
      console.error("A apărut o eroare la citirea fișierului:", error);
      return;
    }



    const updatedContent = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" type="text/css" href="../css/leaderboard.css" />
        <link rel="stylesheet" type="text/css" href="../css/common.css" />
        <link rel="stylesheet" type="text/css" href="../css/responsive.css" />
        <link rel="icon" type="image/x-icon" href="../css/img/Logo.png" />
        <title>Leaderboard</title>
        <style>
          #user-table {
            margin: 0 auto;
            text-align: center;
          }

          #user-table th,
          #user-table td {
            padding: 10px;
          }
        </style>
      </head>
      <body>
        <div class="leaderboard" id="leaderboardContainer">
          <table id="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              ${userScore}
            </tbody>
          </table>
        </div>

        <!-- top bar -->
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
    </html>`;

    fs.writeFile(filePath, updatedContent, (error) => {
      if (error) {
        console.error("A apărut o eroare la scrierea fișierului:", error);
      } else {
        console.log('Fișierul "leaderboard.html" a fost actualizat cu succes.');
      }
    });
  });
}


async function updateLeaderboard() {
  const db = new Database(mongoURL, dbName);
  try {
    await db.connect();

    const users = await db.getUser();

    const htmlContent1 = generateUserList(users);
    createHTMLFile(htmlContent1);
  } catch (error) {
    console.error("A apărut o eroare:", error);
  } finally {
    await db.disconnect();
  }
}

function generateUserList(users) {
  const sortedUsers = users.sort((a, b) => b.score - a.score);

  const tableRows = sortedUsers
    .map(
      (user) => `
    <tr>
      <td>${user.username}</td>
      <td>${user.score}</td>
    </tr>
  `
    )
    .join("");

  return tableRows;
}

updateLeaderboard();
setInterval(updateLeaderboard, 5000);
