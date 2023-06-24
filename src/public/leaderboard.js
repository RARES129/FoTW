require("dotenv").config();
var url = require("url");
var fs = require("fs");
const { MongoClient } = require("mongodb");
const mongoURL = process.env.DB_URL;
const dbName = process.env.DB_NAME;
const Parser= require("rss-parser");

const { Feed } = require("feed");


// Definirea URL-ului și opțiunilor de conectare

// Creează o funcție asincronă pentru a obține utilizatorii și a extrage toate informațiile
async function getUser() {
  // Crează un nou client MongoDB
  // const client = new MongoClient(url);
  const client = new MongoClient(mongoURL);
  try {
    // Conectează-te la baza de date
    await client.connect();

    // Obține referința la baza de date "FoTW"
    const db = client.db(dbName);

    // Obține referința la colecția "users"
    const usersCollection = db.collection('users');

    // Obține toți utilizatorii și extrage toate informațiile
    const users = await usersCollection.find().toArray();

    console.log(users);
    // Returnează array-ul de utilizatori
    return users;
  } catch (error) {
    console.error('A apărut o eroare:', error);
  } finally {
    // Închide conexiunea clientului la baza de date
    await client.close();
  }
}

function generateUserList(users) {
  const userScore = users.map(user => `
    <li>
      ${user.username}
      ${user.score}
    </li>
  `).join('');
  return userScore;
}



async function generateRSS() {
  const usernames = await getUser();

  const feed = new Feed({
    title: 'Leaderboard flux RSS',
    description: 'Leaderboard updates',
    id: 'http://localhost:3000/leaderboard',
    link: 'http://localhost:3000/leaderboard',
    language: 'ro',
  });

  usernames.forEach(user => {
    feed.addItem({
      title: user.username,
      id: user.score,
      link: `http://localhost:3000/leaderboard/users/${user.username}`,
      description: `Leaderboard update for ${user.username}`,
      date: new Date(),
    });
  });

  const rss = feed.rss2();

  fs.writeFile('leaderboard.xml', rss, (error) => {
    if (error) {
      console.error('A apărut o eroare la scrierea fișierului:', error);
    } else {
      console.log('Fișierul "leaderboard.xml" a fost generat cu succes.');
    }
  });
}

generateRSS()
  .catch(error => {
    console.error('A apărut o eroare:', error);
  });

function createHTMLFile(userScore) {
  const filePath = ('../FRUITS ON THE WEB/src/html/leaderboard.html');
  
  fs.readFile(filePath, 'utf-8', (error, fileContent) => {
    if (error) {
      console.error('A apărut o eroare la citirea fișierului:', error);
      return;
    }

    //const updatedContent = fileContent.replace('<!-- Utilizatorii vor fi adăugați aici dinamic -->', userScore);

     const updatedContent= `<!DOCTYPE html>
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
       </head>
       <body>
         <div class="leaderboard" id="leaderboardContainer">
           <ul id="user-list">
           ${userScore}
             
           </ul>
         </div>
     
         <!-- top bar -->
         <input class="menu-icon" type="checkbox" id="menu-icon" name="menu-icon" />
         <label for="menu-icon"></label>
         <nav class="nav">
           <ul class="MenuButtons">
             <li><a href="/">Logout</a></li>
             <li><a href="/help">Help</a></li>
             <li><a href="/about">About</a></li>
             <li><a href="/home"> Home</a></li>
           </ul>
         </nav>
     
         <script src="../public/leaderboard.js"></script>
       </body>
     </html>`





    fs.writeFile(filePath, updatedContent, error => {
      if (error) {
        console.error('A apărut o eroare la scrierea fișierului:', error);
      } else {
        console.log('Fișierul "leaderboard.html" a fost actualizat cu succes.');
      }
    });
  });
}




// Apelul funcției pentru obținerea utilizatorilor și generarea conținutului HTML
getUser()
  .then(users => {
    const htmlContent1 = generateUserList(users);
    createHTMLFile(htmlContent1);
  })
  .catch(error => {
    console.error('A apărut o eroare:', error);
  });

  