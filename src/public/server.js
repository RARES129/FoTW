const http = require('http');
const { serveStaticFile, resetScore, handleGameRequest, handleMoveRequest , createRandomizedFruitGrid} = require('./controllers');
const fruits = ['banana', 'capsuna', 'orange', 'kiwi', 'strugure', 'applee'];
const totalColumns = 8;
const totalRows = 6;
const totalCells = totalColumns * totalRows;
let fruitElements = [];
let score = 0;
var Database = require("./database");

const db = new Database(process.env.DB_URL, process.env.DB_NAME);

async function startServer() {
    await db.connect();
}


const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://fruitsontheweb.onrender.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/game/reset') {
    resetScore(req, res);
  } else if (req.method === 'GET' && req.url === '/game') {
    handleGameRequest(req, res);
  } else if (req.method === 'POST' && req.url === '/game/move') {
    handleMoveRequest(req, res);
  }else if (req.method === 'GET' && req.url === '/game/move') {
    handleMoveRequest(req, res);
  } else {
    serveStaticFile(req, res);
  }
});

const port = 3001;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
